/**
 * Extensão MFA Terminal - Gerenciador de Layouts de Terminal
 */

import * as vscode from 'vscode';
import { LayoutStorageService } from './layoutStorage';
import { TerminalManager } from './terminalManager';
import { TerminalLayout, TerminalConfig, TerminalGroup } from './types';
import * as crypto from 'crypto';

let storageService: LayoutStorageService;
let terminalManager: TerminalManager;

/**
 * Ativa a extensão
 */
export function activate(context: vscode.ExtensionContext) {
	console.log('✨ Extensão MFA Terminal ativada!');

	// Inicializar serviços
	storageService = new LayoutStorageService(context);
	terminalManager = new TerminalManager();

	// Registrar comandos
	context.subscriptions.push(
		vscode.commands.registerCommand('mfa-terminal.saveLayout', saveLayout),
		vscode.commands.registerCommand('mfa-terminal.loadLayout', loadLayout),
		vscode.commands.registerCommand('mfa-terminal.listLayouts', listLayouts),
		vscode.commands.registerCommand('mfa-terminal.deleteLayout', deleteLayout),
		vscode.commands.registerCommand('mfa-terminal.editLayout', editLayout),
		vscode.commands.registerCommand('mfa-terminal.createLayout', createLayout)
	);
}

/**
 * Salva o layout atual de terminais
 */
async function saveLayout() {
	try {
		// Capturar layout atual
		const currentGroups = terminalManager.captureCurrentLayout();
		const totalTerminals = currentGroups.reduce((sum, g) => sum + g.terminals.length, 0);

		console.log('🔍 Terminais capturados:', currentGroups[0]?.terminals.map(t => t.name));

		if (totalTerminals === 0) {
			const action = await vscode.window.showWarningMessage(
				'⚠️ Nenhum terminal aberto. Deseja criar um layout vazio?',
				'Sim',
				'Não'
			);

			if (action !== 'Sim') {
				return;
			}
		}

		// Mostrar ao usuário os terminais que serão salvos
		let terminalNames = '';
		if (totalTerminals > 0) {
			terminalNames = currentGroups[0].terminals.map(t => t.name).join(', ');
		}

		// Solicitar nome do layout
		const name = await vscode.window.showInputBox({
			prompt: totalTerminals > 0 
				? `Salvando terminais: ${terminalNames} | Digite o nome do layout` 
				: 'Digite o nome do layout',
			placeHolder: 'Ex: Layout Dev',
			validateInput: (value) => {
				if (!value || value.trim().length === 0) {
					return 'O nome do layout não pode estar vazio';
				}
				return null;
			},
		});

		if (!name) {
			return;
		}

		// Verificar se já existe um layout com esse nome
		if (await storageService.layoutNameExists(name)) {
			vscode.window.showErrorMessage(`❌ Já existe um layout com o nome "${name}"`);
			return;
		}

		// Perguntar ao usuário como organizar os terminais em grupos
		let groups: TerminalGroup[];
		
		if (totalTerminals > 0) {
			// Mostrar preview dos terminais
			vscode.window.showInformationMessage(
				`📋 Organizando terminais: ${terminalNames}`
			);

			const organizedGroups = await organizeTerminalsIntoGroups(currentGroups[0].terminals);
			if (!organizedGroups) {
				return; // Usuário cancelou
			}
			groups = organizedGroups;
			console.log('🔍 Grupos organizados:', groups);
		} else {
			groups = [];
		}

		// Solicitar descrição (opcional)
		const description = await vscode.window.showInputBox({
			prompt: 'Digite uma descrição para o layout (opcional)',
			placeHolder: 'Ex: Terminais do projeto X',
		});

		// Criar layout
		const layout: TerminalLayout = {
			id: generateId(),
			name: name.trim(),
			description: description?.trim(),
			groups,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		// Salvar layout
		await storageService.saveLayout(layout);

		const groupsInfo = groups.length === 1 ? '1 grupo' : `${groups.length} grupos`;
		vscode.window.showInformationMessage(
			`✅ Layout "${layout.name}" salvo! ${totalTerminals} terminal(is) em ${groupsInfo}.`
		);
	} catch (error) {
		handleError('Erro ao salvar layout', error);
	}
}

/**
 * Carrega e aplica um layout salvo
 */
async function loadLayout() {
	try {
		const layouts = await storageService.getAllLayouts();

		if (layouts.length === 0) {
			const action = await vscode.window.showInformationMessage(
				'📭 Nenhum layout salvo ainda. Deseja criar um novo?',
				'Criar Layout',
				'Cancelar'
			);

			if (action === 'Criar Layout') {
				await createLayout();
			}
			return;
		}

		// Criar lista de opções
		const items = layouts.map(layout => {
			const totalTerminals = layout.groups.reduce((sum, g) => sum + g.terminals.length, 0);
			const groupsInfo = layout.groups.length === 1 
				? '1 grupo' 
				: `${layout.groups.length} grupos`;
			
			return {
				label: `$(terminal) ${layout.name}`,
				description: `${totalTerminals} terminal(is) em ${groupsInfo}`,
				detail: layout.description || 'Sem descrição',
				layout,
			};
		});

		// Mostrar seletor
		const selected = await vscode.window.showQuickPick(items, {
			placeHolder: 'Selecione um layout para carregar',
			matchOnDescription: true,
			matchOnDetail: true,
		});

		if (!selected) {
			return;
		}

		// Perguntar se deve fechar terminais existentes
		let closeExisting = false;
		if (terminalManager.getOpenTerminalsCount() > 0) {
			const action = await vscode.window.showQuickPick(
				[
					{ label: 'Manter terminais existentes', value: false },
					{ label: 'Fechar terminais existentes', value: true },
				],
				{
					placeHolder: 'O que fazer com os terminais abertos?',
				}
			);

			if (!action) {
				return;
			}

			closeExisting = action.value;
		}

		// Aplicar layout
		await terminalManager.applyLayout(selected.layout, closeExisting);
	} catch (error) {
		handleError('Erro ao carregar layout', error);
	}
}

/**
 * Lista todos os layouts salvos
 */
async function listLayouts() {
	try {
		const layouts = await storageService.getAllLayouts();

		if (layouts.length === 0) {
			vscode.window.showInformationMessage('📭 Nenhum layout salvo ainda.');
			return;
		}

		// Criar lista de opções com ações
		const items = layouts.map(layout => {
			const totalTerminals = layout.groups.reduce((sum, g) => sum + g.terminals.length, 0);
			const groupsInfo = layout.groups.length === 1 
				? '1 grupo' 
				: `${layout.groups.length} grupos`;
			
			return {
				label: `$(terminal) ${layout.name}`,
				description: `${totalTerminals} terminal(is) em ${groupsInfo}`,
				detail: layout.description || 'Sem descrição',
				layout,
			};
		});

		// Adicionar opção para criar novo layout
		items.unshift({
			label: '$(add) Criar Novo Layout',
			description: '',
			detail: 'Criar um novo layout de terminal',
			layout: null as any,
		});

		// Mostrar seletor
		const selected = await vscode.window.showQuickPick(items, {
			placeHolder: 'Layouts salvos - Selecione para mais opções',
			matchOnDescription: true,
			matchOnDetail: true,
		});

		if (!selected) {
			return;
		}

		// Se for criar novo layout
		if (!selected.layout) {
			await createLayout();
			return;
		}

		// Mostrar opções para o layout selecionado
		const action = await vscode.window.showQuickPick(
			[
				{ label: '$(play) Carregar', value: 'load' },
				{ label: '$(edit) Editar', value: 'edit' },
				{ label: '$(trash) Deletar', value: 'delete' },
			],
			{
				placeHolder: `Ações para "${selected.layout.name}"`,
			}
		);

		if (!action) {
			return;
		}

		// Executar ação
		switch (action.value) {
			case 'load':
				await terminalManager.applyLayout(selected.layout);
				break;
			case 'edit':
				await editLayoutById(selected.layout.id);
				break;
			case 'delete':
				await deleteLayoutById(selected.layout.id);
				break;
		}
	} catch (error) {
		handleError('Erro ao listar layouts', error);
	}
}

/**
 * Deleta um layout
 */
async function deleteLayout() {
	try {
		const layouts = await storageService.getAllLayouts();

		if (layouts.length === 0) {
			vscode.window.showInformationMessage('📭 Nenhum layout salvo para deletar.');
			return;
		}

		// Criar lista de opções
		const items = layouts.map(layout => {
			const totalTerminals = layout.groups.reduce((sum, g) => sum + g.terminals.length, 0);
			return {
				label: `$(trash) ${layout.name}`,
				description: `${totalTerminals} terminal(is)`,
				detail: layout.description || 'Sem descrição',
				layout,
			};
		});

		// Mostrar seletor
		const selected = await vscode.window.showQuickPick(items, {
			placeHolder: 'Selecione um layout para deletar',
		});

		if (!selected) {
			return;
		}

		await deleteLayoutById(selected.layout.id);
	} catch (error) {
		handleError('Erro ao deletar layout', error);
	}
}

/**
 * Deleta um layout por ID
 */
async function deleteLayoutById(id: string) {
	const layout = await storageService.getLayout(id);
	
	if (!layout) {
		vscode.window.showErrorMessage('❌ Layout não encontrado.');
		return;
	}

	// Confirmar exclusão
	const confirmation = await vscode.window.showWarningMessage(
		`Tem certeza que deseja deletar o layout "${layout.name}"?`,
		{ modal: true },
		'Deletar',
		'Cancelar'
	);

	if (confirmation !== 'Deletar') {
		return;
	}

	// Deletar layout
	const deleted = await storageService.deleteLayout(id);

	if (deleted) {
		vscode.window.showInformationMessage(`🗑️ Layout "${layout.name}" deletado com sucesso!`);
	} else {
		vscode.window.showErrorMessage('❌ Erro ao deletar layout.');
	}
}

/**
 * Edita um layout existente
 */
async function editLayout() {
	try {
		const layouts = await storageService.getAllLayouts();

		if (layouts.length === 0) {
			vscode.window.showInformationMessage('📭 Nenhum layout salvo para editar.');
			return;
		}

		// Criar lista de opções
		const items = layouts.map(layout => {
			const totalTerminals = layout.groups.reduce((sum, g) => sum + g.terminals.length, 0);
			return {
				label: `$(edit) ${layout.name}`,
				description: `${totalTerminals} terminal(is)`,
				detail: layout.description || 'Sem descrição',
				layout,
			};
		});

		// Mostrar seletor
		const selected = await vscode.window.showQuickPick(items, {
			placeHolder: 'Selecione um layout para editar',
		});

		if (!selected) {
			return;
		}

		await editLayoutById(selected.layout.id);
	} catch (error) {
		handleError('Erro ao editar layout', error);
	}
}

/**
 * Edita um layout por ID
 */
async function editLayoutById(id: string) {
	const layout = await storageService.getLayout(id);
	
	if (!layout) {
		vscode.window.showErrorMessage('❌ Layout não encontrado.');
		return;
	}

	// Mostrar opções de edição
	const action = await vscode.window.showQuickPick(
		[
			{ label: '$(pencil) Editar nome', value: 'name' },
			{ label: '$(note) Editar descrição', value: 'description' },
			{ label: '$(refresh) Atualizar com layout atual', value: 'update-layout' },
		],
		{
			placeHolder: `Editar layout "${layout.name}"`,
		}
	);

	if (!action) {
		return;
	}

	switch (action.value) {
		case 'name':
			await editLayoutName(layout);
			break;
		case 'description':
			await editLayoutDescription(layout);
			break;
		case 'update-layout':
			await updateLayoutStructure(layout);
			break;
	}
}

/**
 * Edita o nome de um layout
 */
async function editLayoutName(layout: TerminalLayout) {
	const newName = await vscode.window.showInputBox({
		prompt: 'Digite o novo nome do layout',
		value: layout.name,
		validateInput: (value) => {
			if (!value || value.trim().length === 0) {
				return 'O nome do layout não pode estar vazio';
			}
			return null;
		},
	});

	if (!newName || newName === layout.name) {
		return;
	}

	// Verificar se já existe um layout com esse nome
	if (await storageService.layoutNameExists(newName, layout.id)) {
		vscode.window.showErrorMessage(`❌ Já existe um layout com o nome "${newName}"`);
		return;
	}

	await storageService.updateLayout(layout.id, { name: newName.trim() });
	vscode.window.showInformationMessage(`✅ Nome atualizado para "${newName}"`);
}

/**
 * Edita a descrição de um layout
 */
async function editLayoutDescription(layout: TerminalLayout) {
	const newDescription = await vscode.window.showInputBox({
		prompt: 'Digite a nova descrição do layout',
		value: layout.description,
	});

	if (newDescription === undefined) {
		return;
	}

	await storageService.updateLayout(layout.id, { description: newDescription.trim() });
	vscode.window.showInformationMessage('✅ Descrição atualizada com sucesso!');
}

/**
 * Atualiza o layout de um layout com os terminais atuais
 */
async function updateLayoutStructure(layout: TerminalLayout) {
	const currentGroups = terminalManager.captureCurrentLayout();
	const totalTerminals = currentGroups.reduce((sum, g) => sum + g.terminals.length, 0);

	if (totalTerminals === 0) {
		const action = await vscode.window.showWarningMessage(
			'⚠️ Nenhum terminal aberto. Deseja limpar o layout?',
			'Sim',
			'Não'
		);

		if (action !== 'Sim') {
			return;
		}
	}

	// Perguntar ao usuário como organizar os terminais em grupos
	let groups: TerminalGroup[];
	
	if (totalTerminals > 0) {
		const organizedGroups = await organizeTerminalsIntoGroups(currentGroups[0].terminals);
		if (!organizedGroups) {
			return; // Usuário cancelou
		}
		groups = organizedGroups;
	} else {
		groups = [];
	}

	await storageService.updateLayout(layout.id, { groups });
	const groupsInfo = groups.length === 1 ? '1 grupo' : `${groups.length} grupos`;
	vscode.window.showInformationMessage(
		`✅ Layout atualizado! ${totalTerminals} terminal(is) em ${groupsInfo}.`
	);
}

/**
 * Cria um novo layout do zero com interface assistida
 */
async function createLayout() {
	try {
		vscode.window.showInformationMessage(
			'📝 Vamos criar um novo layout! Você pode adicionar grupos de terminais.'
		);

		// Solicitar nome do layout
		const name = await vscode.window.showInputBox({
			prompt: 'Digite o nome do layout',
			placeHolder: 'Ex: Desenvolvimento Full Stack',
			validateInput: (value) => {
				if (!value || value.trim().length === 0) {
					return 'O nome do layout não pode estar vazio';
				}
				return null;
			},
		});

		if (!name) {
			return;
		}

		// Verificar se já existe um layout com esse nome
		if (await storageService.layoutNameExists(name)) {
			vscode.window.showErrorMessage(`❌ Já existe um layout com o nome "${name}"`);
			return;
		}

		// Solicitar descrição (opcional)
		const description = await vscode.window.showInputBox({
			prompt: 'Digite uma descrição para o layout (opcional)',
			placeHolder: 'Ex: Terminal para desenvolvimento com frontend e backend',
		});

	// Adicionar terminais
	const terminals: TerminalConfig[] = [];
	let addMore = true;

	while (addMore) {
		const terminalName = await vscode.window.showInputBox({
			prompt: `Terminal ${terminals.length + 1}: Digite o nome`,
			placeHolder: 'Ex: Backend Server',
		});

		if (!terminalName) {
			break;
		}

		const profileName = await selectTerminalProfile();

		const command = await vscode.window.showInputBox({
			prompt: `Terminal "${terminalName}": Comando a executar (opcional)`,
			placeHolder: 'Ex: npm run dev',
		});

		const cwd = await vscode.window.showInputBox({
			prompt: `Terminal "${terminalName}": Diretório de trabalho (opcional)`,
			placeHolder: 'Ex: ./backend',
		});

		terminals.push({
			name: terminalName.trim(),
			profileName: profileName,
			command: command?.trim(),
			cwd: cwd?.trim(),
		});

		const action = await vscode.window.showQuickPick(
			['Adicionar mais um terminal', 'Finalizar'],
			{
				placeHolder: `${terminals.length} terminal(is) adicionado(s)`,
			}
		);

		addMore = action === 'Adicionar mais um terminal';
	}

		if (terminals.length === 0) {
			vscode.window.showWarningMessage('⚠️ Nenhum terminal adicionado. Layout não foi criado.');
			return;
		}

		// Organizar terminais em grupos
		const groups = await organizeTerminalsIntoGroups(terminals);
		if (!groups) {
			return; // Usuário cancelou
		}

		// Criar layout
		const layout: TerminalLayout = {
			id: generateId(),
			name: name.trim(),
			description: description?.trim(),
			groups,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		// Salvar layout
		await storageService.saveLayout(layout);

		const groupsInfo = groups.length === 1 ? '1 grupo' : `${groups.length} grupos`;
		vscode.window.showInformationMessage(
			`✅ Layout "${layout.name}" criado! ${terminals.length} terminal(is) em ${groupsInfo}.`
		);
	} catch (error) {
		handleError('Erro ao criar layout', error);
	}
}

/**
 * Permite ao usuário organizar terminais em grupos (split layout)
 * @param terminals Lista de terminais a serem organizados
 * @returns Lista de grupos organizados ou undefined se cancelado
 */
async function organizeTerminalsIntoGroups(terminals: TerminalConfig[]): Promise<TerminalGroup[] | undefined> {
	if (terminals.length === 0) {
		return [];
	}

	if (terminals.length === 1) {
		// Apenas um terminal - um grupo
		return [{
			id: 0,
			terminals: [terminals[0]],
		}];
	}

		// Mostrar os nomes dos terminais que serão organizados
	const terminalNamesList = terminals.map((t, i) => {
		let info = `  ${i + 1}. ${t.name}`;
		if (t.profileName) {
			info += ` [${t.profileName}]`;
		}
		return info;
	}).join('\n');
	
	// Perguntar ao usuário como organizar
	const organizationMethod = await vscode.window.showQuickPick(
		[
			{
				label: '$(layout) Cada terminal separado',
				description: `${terminals.length} terminais independentes`,
				detail: `Recreia: ${terminals.map(t => {
					const profile = t.profileName ? `(${t.profileName})` : '';
					return `[${t.name}${profile}]`;
				}).join(' ')}`,
				value: 'separate',
			},
			{
				label: '$(split-horizontal) Todos splitados (lado a lado)',
				description: `${terminals.length} terminais juntos`,
				detail: `Recreia: [${terminals.map(t => {
					const profile = t.profileName ? `(${t.profileName})` : '';
					return `${t.name}${profile}`;
				}).join(' | ')}]`,
				value: 'together',
			},
			{
				label: '$(edit) Organizar manualmente os splits',
				description: 'Você escolhe quais ficam lado a lado',
				detail: 'Defina quais terminais ficam splitados juntos',
				value: 'manual',
			},
		],
		{
			placeHolder: `⚠️ IMPORTANTE: Defina a estrutura de SPLITS dos terminais capturados`,
			title: `Terminais: ${terminals.map(t => t.name).join(', ')}`,
		}
	);

	if (!organizationMethod) {
		return undefined;
	}

	switch (organizationMethod.value) {
		case 'separate':
			// Cada terminal em seu próprio grupo
			const separateGroups = terminals.map((terminal, index) => ({
				id: index,
				terminals: [terminal],
			}));
			console.log('🔷 Organização SEPARADA criada:', separateGroups.length, 'grupos');
			separateGroups.forEach((g, i) => {
				console.log(`  Grupo ${i + 1}:`, g.terminals.map(t => t.name));
			});
			return separateGroups;

		case 'together':
			// Todos em um grupo
			const togetherGroup = [{
				id: 0,
				terminals: terminals,
			}];
			console.log('🔷 Organização JUNTOS criada: 1 grupo com', terminals.length, 'terminais');
			return togetherGroup;

		case 'manual':
			const manualGroups = await organizeTerminalsManually(terminals);
			if (manualGroups) {
				console.log('🔷 Organização MANUAL criada:', manualGroups.length, 'grupos');
				manualGroups.forEach((g, i) => {
					console.log(`  Grupo ${i + 1}:`, g.terminals.map(t => t.name));
				});
			}
			return manualGroups;

		default:
			return undefined;
	}
}

/**
 * Permite ao usuário organizar terminais manualmente em grupos
 */
async function organizeTerminalsManually(terminals: TerminalConfig[]): Promise<TerminalGroup[] | undefined> {
	const groups: TerminalGroup[] = [];
	const availableTerminals = [...terminals];
	let groupId = 0;

	vscode.window.showInformationMessage(
		'💡 Terminais no mesmo grupo = SPLITADOS (lado a lado) | Grupos diferentes = SEPARADOS'
	);

	while (availableTerminals.length > 0) {
		// Mostrar terminais disponíveis
		const terminalItems = availableTerminals.map((terminal, index) => {
			let description = terminal.cwd || 'Terminal capturado';
			if (terminal.profileName) {
				description = `${terminal.profileName} | ${description}`;
			}
			return {
				label: `$(terminal) ${terminal.name}`,
				description: description,
				picked: false,
				terminal,
				index,
			};
		});

		const groupNumber = groups.length + 1;
		const groupsCreatedInfo = groups.length > 0 
			? ` | ${groups.length} grupo(s) criado(s)` 
			: '';
		
		const selected = await vscode.window.showQuickPick(terminalItems, {
			placeHolder: `Grupo ${groupNumber}: Selecione terminais que ficarão LADO A LADO (Ctrl+Click para múltiplos)${groupsCreatedInfo}`,
			canPickMany: true,
			title: `${availableTerminals.length} terminal(is) restante(s) para organizar`,
		});

		if (!selected || selected.length === 0) {
			// Se não selecionou nada e ainda há terminais, criar grupos individuais
			if (availableTerminals.length > 0) {
				const action = await vscode.window.showQuickPick(
					[
						{ label: 'Criar grupos individuais para o restante', value: 'individual' },
						{ label: 'Cancelar criação de layout', value: 'cancel' },
					],
					{
						placeHolder: `${availableTerminals.length} terminal(is) ainda não agrupado(s)`,
					}
				);

				if (action?.value === 'individual') {
					// Criar um grupo para cada terminal restante
					availableTerminals.forEach(terminal => {
						groups.push({
							id: groupId++,
							terminals: [terminal],
						});
					});
					break;
				} else {
					return undefined; // Cancelar
				}
			}
			break;
		}

		// Criar grupo com terminais selecionados
		const groupTerminals = selected.map(item => item.terminal);
		groups.push({
			id: groupId++,
			terminals: groupTerminals,
		});

		// Remover terminais selecionados da lista de disponíveis
		selected.forEach(item => {
			const index = availableTerminals.findIndex(t => t === item.terminal);
			if (index !== -1) {
				availableTerminals.splice(index, 1);
			}
		});

		// Se ainda há terminais, perguntar se quer adicionar mais grupos
		if (availableTerminals.length > 0) {
			const continueAction = await vscode.window.showQuickPick(
				['Adicionar mais um grupo', 'Finalizar (criar grupos individuais para o restante)'],
				{
					placeHolder: `Grupo ${groupNumber} criado com ${groupTerminals.length} terminal(is). ${availableTerminals.length} restante(s).`,
				}
			);

			if (continueAction !== 'Adicionar mais um grupo') {
				// Criar um grupo para cada terminal restante
				availableTerminals.forEach(terminal => {
					groups.push({
						id: groupId++,
						terminals: [terminal],
					});
				});
				break;
			}
		}
	}

	return groups;
}

/**
 * Obtém os perfis de terminal disponíveis
 */
async function getAvailableTerminalProfiles(): Promise<Array<{ label: string; profileName: string | undefined }>> {
	// Obter perfis configurados
	const config = vscode.workspace.getConfiguration('terminal.integrated.profiles');
	const profiles: Array<{ label: string; profileName: string | undefined }> = [
		{ label: '$(terminal) Padrão do Sistema', profileName: undefined }
	];

	// Detectar plataforma
	const platform = process.platform === 'win32' ? 'windows' : process.platform === 'darwin' ? 'osx' : 'linux';
	const platformProfiles = config.get<Record<string, any>>(platform);

	console.log(`🔍 Detectando perfis de terminal (Plataforma: ${platform})`);
	
	if (platformProfiles) {
		console.log(`📋 Perfis encontrados:`, Object.keys(platformProfiles));
		
		Object.keys(platformProfiles).forEach(profileName => {
			const profile = platformProfiles[profileName];
			console.log(`  - ${profileName}:`, {
				hasPath: !!profile.path,
				hasSource: !!profile.source,
				hasArgs: !!profile.args
			});
			
			// Adicionar perfil com ícone apropriado
			let icon = '$(terminal)';
			if (profileName.toLowerCase().includes('powershell')) {
				icon = '$(terminal-powershell)';
			} else if (profileName.toLowerCase().includes('bash')) {
				icon = '$(terminal-bash)';
			} else if (profileName.toLowerCase().includes('cmd')) {
				icon = '$(terminal-cmd)';
			}
			
			profiles.push({
				label: `${icon} ${profileName}`,
				profileName: profileName
			});
		});
	} else {
		console.log(`⚠️ Nenhum perfil encontrado para a plataforma ${platform}`);
	}

	return profiles;
}

/**
 * Permite ao usuário selecionar um perfil de terminal
 */
async function selectTerminalProfile(): Promise<string | undefined> {
	const profiles = await getAvailableTerminalProfiles();
	
	const selected = await vscode.window.showQuickPick(profiles, {
		placeHolder: 'Selecione o perfil do terminal (opcional)',
		title: 'Perfil do Terminal'
	});

	return selected?.profileName;
}

/**
 * Gera um ID único
 */
function generateId(): string {
	return crypto.randomBytes(16).toString('hex');
}

/**
 * Trata erros de forma centralizada
 */
function handleError(message: string, error: any) {
	console.error(message, error);
	vscode.window.showErrorMessage(`${message}: ${error.message || error}`);
}

/**
 * Desativa a extensão
 */
export function deactivate() {
	console.log('👋 Extensão MFA Terminal desativada');
}
