/**
 * Gerenciador de terminais
 */

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { TerminalLayout, TerminalConfig, TerminalGroup } from './types';

/**
 * Gerenciador de criação e controle de terminais
 */
export class TerminalManager {
	/**
	 * Aplica um layout de terminal, criando os terminais configurados com seus grupos
	 */
	async applyLayout(layout: TerminalLayout, closeExisting: boolean = false): Promise<void> {
		console.log('🚀 Aplicando layout:', layout.name);
		console.log('📊 Grupos no layout:', layout.groups);
		
		// Fechar terminais existentes se solicitado
		if (closeExisting) {
			this.closeAllTerminals();
		}

		// Contador total de terminais
		let totalTerminals = 0;

		// Criar cada grupo de terminais
		for (let i = 0; i < layout.groups.length; i++) {
			const group = layout.groups[i];
			console.log(`📁 Criando grupo ${i + 1}:`, group.terminals.map(t => t.name));
			await this.createTerminalGroup(group);
			totalTerminals += group.terminals.length;
		}

		// Mostrar mensagem de sucesso
		const groupsInfo = layout.groups.length === 1 
			? '1 grupo' 
			: `${layout.groups.length} grupos`;
		
		vscode.window.showInformationMessage(
			`✅ Layout "${layout.name}" aplicado! ${totalTerminals} terminal(is) em ${groupsInfo}.`
		);
	}

	/**
	 * Cria um grupo de terminais (terminais splitados juntos)
	 */
	private async createTerminalGroup(group: TerminalGroup): Promise<void> {
		if (group.terminals.length === 0) {
			return;
		}

		// Criar primeiro terminal do grupo
		console.log(`  🔨 Criando terminal 1/${group.terminals.length}: "${group.terminals[0].name}"`);
		const firstTerminal = await this.createTerminalSimple(group.terminals[0]);
		
		// Mostrar o terminal para garantir que está ativo
		firstTerminal.show();
		await this.delay(500);

		// Para cada terminal adicional, fazer split
		for (let i = 1; i < group.terminals.length; i++) {
			const terminalConfig = group.terminals[i];
			console.log(`  🔨 Criando terminal ${i + 1}/${group.terminals.length}: "${terminalConfig.name}"`);
			console.log(`    ↪️ Tentando split com "${firstTerminal.name}"`);
			
			// Focar no primeiro terminal antes de fazer split
			firstTerminal.show();
			await this.delay(200);
			
			// Executar comando de split
			await vscode.commands.executeCommand('workbench.action.terminal.split');
			await this.delay(300);
			
			// O terminal splitado é o último terminal ativo
			const terminals = vscode.window.terminals;
			const newTerminal = terminals[terminals.length - 1];
			
			if (newTerminal) {
				console.log(`    ✅ Terminal splitado criado, renomeando para "${terminalConfig.name}"`);
				
				// Renomear o terminal
				await vscode.commands.executeCommand('workbench.action.terminal.renameWithArg', {
					name: terminalConfig.name
				});
				
				// Executar comando se especificado
				if (terminalConfig.command) {
					await this.delay(300);
					newTerminal.sendText(terminalConfig.command);
				}
			}
			
			await this.delay(200);
		}
	}

	/**
	 * Cria um terminal simples sem split (usado para o primeiro terminal do grupo)
	 */
	private async createTerminalSimple(config: TerminalConfig): Promise<vscode.Terminal> {
		let terminal: vscode.Terminal;

		// Se um perfil foi especificado, criar terminal com esse perfil
		if (config.profileName) {
			console.log(`🎯 Tentando criar terminal "${config.name}" com perfil "${config.profileName}"`);
			
			// Usar comando interno do VS Code para criar terminal com perfil
			// Isso garante que o perfil seja aplicado corretamente
			const terminalCountBefore = vscode.window.terminals.length;
			
			try {
				// Primeiro, definir o perfil padrão temporariamente
				const platform = process.platform === 'win32' ? 'windows' : process.platform === 'darwin' ? 'osx' : 'linux';
				const defaultProfileKey = `terminal.integrated.defaultProfile.${platform}`;
				const currentDefault = vscode.workspace.getConfiguration().get(defaultProfileKey);
				
				console.log(`📝 Perfil padrão atual: ${currentDefault}`);
				console.log(`🔄 Alterando perfil padrão temporariamente para: ${config.profileName}`);
				
				// Alterar perfil padrão temporariamente
				await vscode.workspace.getConfiguration().update(
					defaultProfileKey,
					config.profileName,
					vscode.ConfigurationTarget.Global
				);
				
				await this.delay(100);
				
				// Criar terminal com perfil
				const terminalOptions: vscode.TerminalOptions = {
					name: config.name,
					env: config.env,
				};
				
				// Adicionar cwd se especificado
				if (config.cwd) {
					const resolvedPath = this.resolvePath(config.cwd);
					if (resolvedPath && fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isDirectory()) {
						terminalOptions.cwd = resolvedPath;
					}
				}
				
				console.log(`✅ Criando terminal com opções:`, terminalOptions);
				terminal = vscode.window.createTerminal(terminalOptions);
				
				await this.delay(200);
				
				// Restaurar perfil padrão original
				console.log(`🔙 Restaurando perfil padrão para: ${currentDefault || 'null'}`);
				await vscode.workspace.getConfiguration().update(
					defaultProfileKey,
					currentDefault,
					vscode.ConfigurationTarget.Global
				);
				
				console.log(`✅ Terminal criado com sucesso!`);
				
			} catch (error) {
				console.error(`❌ Erro ao criar terminal com perfil:`, error);
				vscode.window.showWarningMessage(
					`⚠️ Erro ao criar terminal "${config.name}" com perfil "${config.profileName}". Usando perfil padrão.`
				);
				// Fallback para criar sem perfil
				terminal = await this.createTerminalWithoutProfile(config);
			}
		} else {
			// Criar terminal sem perfil específico (usa o padrão)
			terminal = await this.createTerminalWithoutProfile(config);
		}
		
		// Executar comando se especificado
		if (config.command) {
			await this.delay(500);
			terminal.sendText(config.command);
		}

		return terminal;
	}

	/**
	 * Cria um terminal sem perfil específico (usa configurações padrão)
	 */
	private async createTerminalWithoutProfile(config: TerminalConfig): Promise<vscode.Terminal> {
		const terminalOptions: vscode.TerminalOptions = {
			name: config.name,
			env: config.env,
		};

		// Resolver e validar o diretório de trabalho
		if (config.cwd) {
			const resolvedPath = this.resolvePath(config.cwd);
			
			if (resolvedPath) {
				if (fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isDirectory()) {
					terminalOptions.cwd = resolvedPath;
				} else {
					vscode.window.showErrorMessage(
						`⚠️ Terminal "${config.name}": Diretório "${config.cwd}" não existe.`
					);
				}
			}
		}

		return vscode.window.createTerminal(terminalOptions);
	}

	/**
	 * Cria um único terminal com base na configuração
	 * @param config Configuração do terminal
	 * @param parentTerminal Terminal pai para fazer split (opcional)
	 * @deprecated Usar createTerminalSimple ao invés
	 */
	private async createTerminal(config: TerminalConfig, parentTerminal?: vscode.Terminal): Promise<vscode.Terminal> {
		const terminalOptions: vscode.TerminalOptions = {
			name: config.name,
			env: config.env,
		};

		// Resolver e validar o diretório de trabalho
		if (config.cwd) {
			const resolvedPath = this.resolvePath(config.cwd);
			
			if (resolvedPath) {
				// Verificar se o diretório existe
				if (fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isDirectory()) {
					terminalOptions.cwd = resolvedPath;
				} else {
					// Mostrar erro e não criar o terminal com cwd inválido
					vscode.window.showErrorMessage(
						`⚠️ Terminal "${config.name}": Diretório "${config.cwd}" não existe. O terminal será criado no diretório padrão.`
					);
					// Não adicionar o cwd, deixar o terminal usar o padrão
				}
			}
		}

		// Adicionar ícone se especificado
		if (config.icon) {
			terminalOptions.iconPath = new vscode.ThemeIcon(config.icon);
		}

		// Adicionar cor se especificado
		if (config.color) {
			terminalOptions.color = new vscode.ThemeColor(config.color);
		}

		// Se há um terminal pai, fazer split
		if (parentTerminal) {
			console.log(`      🔗 Configurando location com parentTerminal: "${parentTerminal.name}"`);
			terminalOptions.location = { parentTerminal: parentTerminal };
		}

		// Criar o terminal
		console.log(`      ⚙️ Criando terminal com opções:`, {
			name: terminalOptions.name,
			hasLocation: !!terminalOptions.location,
			hasCwd: !!terminalOptions.cwd,
		});
		
		const terminal = vscode.window.createTerminal(terminalOptions);
		
		console.log(`      ✅ Terminal criado: "${terminal.name}"`);

		// Mostrar o terminal para garantir que seja renderizado
		if (!parentTerminal) {
			// Apenas mostrar o primeiro terminal do grupo
			terminal.show(false); // false = não roubar o foco
		}

		// Executar comando se especificado
		if (config.command) {
			// Aguardar um pouco para o terminal inicializar
			await this.delay(500);
			terminal.sendText(config.command);
		}

		return terminal;
	}

	/**
	 * Resolve variáveis de ambiente em um caminho
	 * Ex: ${env:windir}\\System32 -> C:\\Windows\\System32
	 */
	private resolveEnvVars(pathStr: string): string {
		if (!pathStr) {
			return pathStr;
		}

		// Substituir variáveis de ambiente no formato ${env:VAR}
		return pathStr.replace(/\$\{env:([^}]+)\}/gi, (_, varName) => {
			return process.env[varName] || '';
		});
	}

	/**
	 * Resolve um caminho relativo ou absoluto em relação ao workspace
	 */
	private resolvePath(pathStr: string): string | undefined {
		// Se for caminho absoluto, retornar diretamente
		if (path.isAbsolute(pathStr)) {
			return pathStr;
		}

		// Tentar resolver em relação ao workspace atual
		const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
		
		if (workspaceFolder) {
			return path.resolve(workspaceFolder.uri.fsPath, pathStr);
		}

		// Se não houver workspace, mostrar aviso
		vscode.window.showWarningMessage(
			'⚠️ Nenhum workspace aberto. Não é possível resolver caminhos relativos.'
		);
		
		return undefined;
	}

	/**
	 * Captura o layout atual de terminais
	 * Retorna uma estrutura de grupos com os terminais
	 * Nota: A API do VS Code não expõe informações de grupos diretamente,
	 * então retornamos todos os terminais em um único grupo
	 */
	captureCurrentLayout(): TerminalGroup[] {
		const terminals = vscode.window.terminals;
		
		console.log('📊 Total de terminais no VS Code:', terminals.length);
		
		const terminalConfigs: TerminalConfig[] = terminals.map((terminal, index) => {
			console.log(`  Terminal ${index + 1}: "${terminal.name}"`);
			
			const config: TerminalConfig = {
				name: terminal.name,
			};

			// Nota: Infelizmente, a API do VS Code não permite ler
			// o diretório atual, comandos executados ou variáveis de ambiente
			// de terminais existentes. Estes precisam ser configurados manualmente.

			return config;
		});

		console.log('✅ Terminais capturados:', terminalConfigs.length);

		// Retornar todos em um único grupo
		// O usuário poderá reorganizar manualmente depois
		return [{
			id: 0,
			terminals: terminalConfigs,
		}];
	}

	/**
	 * Fecha todos os terminais abertos
	 */
	private closeAllTerminals(): void {
		const terminals = vscode.window.terminals;
		terminals.forEach(terminal => terminal.dispose());
	}

	/**
	 * Aguarda um tempo especificado
	 */
	private delay(ms: number): Promise<void> {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	/**
	 * Obtém o número de terminais abertos
	 */
	getOpenTerminalsCount(): number {
		return vscode.window.terminals.length;
	}
}

