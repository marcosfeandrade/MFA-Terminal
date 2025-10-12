/**
 * MFA Terminal Extension - Terminal Layout Manager
 */

import * as vscode from 'vscode';
import { LayoutStorageService } from './layoutStorage';
import { TerminalManager } from './terminalManager';
import { TerminalLayout, TerminalConfig, TerminalGroup } from './types';
import * as crypto from 'crypto';

let storageService: LayoutStorageService;
let terminalManager: TerminalManager;

/**
 * Activates the extension
 */
export function activate(context: vscode.ExtensionContext) {
	console.log('✨ MFA Terminal extension activated!');

	// Initialize services
	storageService = new LayoutStorageService(context);
	terminalManager = new TerminalManager();

	// Register commands
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
 * Saves the current terminal layout
 */
async function saveLayout() {
	try {
		// Capture current layout
		const currentGroups = terminalManager.captureCurrentLayout();
		const totalTerminals = currentGroups.reduce((sum, g) => sum + g.terminals.length, 0);

		console.log('🔍 Captured terminals:', currentGroups[0]?.terminals.map(t => t.name));

		if (totalTerminals === 0) {
			const action = await vscode.window.showWarningMessage(
				'⚠️ No open terminals. Do you want to create an empty layout?',
				'Yes',
				'No'
			);

			if (action !== 'Yes') {
				return;
			}
		}

		// Show user the terminals that will be saved
		let terminalNames = '';
		if (totalTerminals > 0) {
			terminalNames = currentGroups[0].terminals.map(t => t.name).join(', ');
		}

		// Request layout name
		const name = await vscode.window.showInputBox({
			prompt: totalTerminals > 0 
				? `Saving terminals: ${terminalNames} | Enter layout name` 
				: 'Enter layout name',
			placeHolder: 'Ex: Dev Layout',
			validateInput: (value) => {
				if (!value || value.trim().length === 0) {
					return 'Layout name cannot be empty';
				}
				return null;
			},
		});

		if (!name) {
			return;
		}

		// Check if a layout with this name already exists
		if (await storageService.layoutNameExists(name)) {
			vscode.window.showErrorMessage(`❌ A layout named "${name}" already exists`);
			return;
		}

		// Ask user how to organize terminals into groups
		let groups: TerminalGroup[];
		
		if (totalTerminals > 0) {
			// Show terminal preview
			vscode.window.showInformationMessage(
				`📋 Organizing terminals: ${terminalNames}`
			);

			const organizedGroups = await organizeTerminalsIntoGroups(currentGroups[0].terminals);
			if (!organizedGroups) {
				return; // User cancelled
			}
			groups = organizedGroups;
			console.log('🔍 Organized groups:', groups);
		} else {
			groups = [];
		}

		// Request description (optional)
		const description = await vscode.window.showInputBox({
			prompt: 'Enter a description for the layout (optional)',
			placeHolder: 'Ex: Project X terminals',
		});

		// Create layout
		const layout: TerminalLayout = {
			id: generateId(),
			name: name.trim(),
			description: description?.trim(),
			groups,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		// Save layout
		await storageService.saveLayout(layout);

		const groupsInfo = groups.length === 1 ? '1 group' : `${groups.length} groups`;
		vscode.window.showInformationMessage(
			`✅ Layout "${layout.name}" saved! ${totalTerminals} terminal(s) in ${groupsInfo}.`
		);
	} catch (error) {
		handleError('Error saving layout', error);
	}
}

/**
 * Loads and applies a saved layout
 */
async function loadLayout() {
	try {
		const layouts = await storageService.getAllLayouts();

		if (layouts.length === 0) {
			const action = await vscode.window.showInformationMessage(
				'📭 No saved layouts yet. Do you want to create a new one?',
				'Create Layout',
				'Cancel'
			);

			if (action === 'Create Layout') {
				await createLayout();
			}
			return;
		}

		// Create options list
		const items = layouts.map(layout => {
			const totalTerminals = layout.groups.reduce((sum, g) => sum + g.terminals.length, 0);
			const groupsInfo = layout.groups.length === 1 
				? '1 group' 
				: `${layout.groups.length} groups`;
			
			return {
				label: `$(terminal) ${layout.name}`,
				description: `${totalTerminals} terminal(s) in ${groupsInfo}`,
				detail: layout.description || 'No description',
				layout,
			};
		});

		// Show selector
		const selected = await vscode.window.showQuickPick(items, {
			placeHolder: 'Select a layout to load',
			matchOnDescription: true,
			matchOnDetail: true,
		});

		if (!selected) {
			return;
		}

		// Ask whether to close existing terminals
		let closeExisting = false;
		if (terminalManager.getOpenTerminalsCount() > 0) {
			const action = await vscode.window.showQuickPick(
				[
					{ label: 'Keep existing terminals', value: false },
					{ label: 'Close existing terminals', value: true },
				],
				{
					placeHolder: 'What to do with open terminals?',
				}
			);

			if (!action) {
				return;
			}

			closeExisting = action.value;
		}

		// Apply layout
		await terminalManager.applyLayout(selected.layout, closeExisting);
	} catch (error) {
		handleError('Error loading layout', error);
	}
}

/**
 * Lists all saved layouts
 */
async function listLayouts() {
	try {
		const layouts = await storageService.getAllLayouts();

		if (layouts.length === 0) {
			vscode.window.showInformationMessage('📭 No saved layouts yet.');
			return;
		}

		// Create options list with actions
		const items = layouts.map(layout => {
			const totalTerminals = layout.groups.reduce((sum, g) => sum + g.terminals.length, 0);
			const groupsInfo = layout.groups.length === 1 
				? '1 group' 
				: `${layout.groups.length} groups`;
			
			return {
				label: `$(terminal) ${layout.name}`,
				description: `${totalTerminals} terminal(s) in ${groupsInfo}`,
				detail: layout.description || 'No description',
				layout,
			};
		});

		// Add option to create new layout
		items.unshift({
			label: '$(add) Create New Layout',
			description: '',
			detail: 'Create a new terminal layout',
			layout: null as any,
		});

		// Show selector
		const selected = await vscode.window.showQuickPick(items, {
			placeHolder: 'Saved layouts - Select for more options',
			matchOnDescription: true,
			matchOnDetail: true,
		});

		if (!selected) {
			return;
		}

		// If creating new layout
		if (!selected.layout) {
			await createLayout();
			return;
		}

		// Show options for selected layout
		const action = await vscode.window.showQuickPick(
			[
				{ label: '$(play) Load', value: 'load' },
				{ label: '$(edit) Edit', value: 'edit' },
				{ label: '$(trash) Delete', value: 'delete' },
			],
			{
				placeHolder: `Actions for "${selected.layout.name}"`,
			}
		);

		if (!action) {
			return;
		}

		// Execute action
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
		handleError('Error listing layouts', error);
	}
}

/**
 * Deletes a layout
 */
async function deleteLayout() {
	try {
		const layouts = await storageService.getAllLayouts();

		if (layouts.length === 0) {
			vscode.window.showInformationMessage('📭 No saved layouts to delete.');
			return;
		}

		// Create options list
		const items = layouts.map(layout => {
			const totalTerminals = layout.groups.reduce((sum, g) => sum + g.terminals.length, 0);
			return {
				label: `$(trash) ${layout.name}`,
				description: `${totalTerminals} terminal(s)`,
				detail: layout.description || 'No description',
				layout,
			};
		});

		// Show selector
		const selected = await vscode.window.showQuickPick(items, {
			placeHolder: 'Select a layout to delete',
		});

		if (!selected) {
			return;
		}

		await deleteLayoutById(selected.layout.id);
	} catch (error) {
		handleError('Error deleting layout', error);
	}
}

/**
 * Deletes a layout by ID
 */
async function deleteLayoutById(id: string) {
	const layout = await storageService.getLayout(id);
	
	if (!layout) {
		vscode.window.showErrorMessage('❌ Layout not found.');
		return;
	}

	// Confirm deletion
	const confirmation = await vscode.window.showWarningMessage(
		`Are you sure you want to delete the layout "${layout.name}"?`,
		{ modal: true },
		'Delete',
		'Cancel'
	);

	if (confirmation !== 'Delete') {
		return;
	}

	// Delete layout
	const deleted = await storageService.deleteLayout(id);

	if (deleted) {
		vscode.window.showInformationMessage(`🗑️ Layout "${layout.name}" deleted successfully!`);
	} else {
		vscode.window.showErrorMessage('❌ Error deleting layout.');
	}
}

/**
 * Edits an existing layout
 */
async function editLayout() {
	try {
		const layouts = await storageService.getAllLayouts();

		if (layouts.length === 0) {
			vscode.window.showInformationMessage('📭 No saved layouts to edit.');
			return;
		}

		// Create options list
		const items = layouts.map(layout => {
			const totalTerminals = layout.groups.reduce((sum, g) => sum + g.terminals.length, 0);
			return {
				label: `$(edit) ${layout.name}`,
				description: `${totalTerminals} terminal(s)`,
				detail: layout.description || 'No description',
				layout,
			};
		});

		// Show selector
		const selected = await vscode.window.showQuickPick(items, {
			placeHolder: 'Select a layout to edit',
		});

		if (!selected) {
			return;
		}

		await editLayoutById(selected.layout.id);
	} catch (error) {
		handleError('Error editing layout', error);
	}
}

/**
 * Edits a layout by ID
 */
async function editLayoutById(id: string) {
	const layout = await storageService.getLayout(id);
	
	if (!layout) {
		vscode.window.showErrorMessage('❌ Layout not found.');
		return;
	}

	// Show edit options
	const action = await vscode.window.showQuickPick(
		[
			{ label: '$(pencil) Edit name', value: 'name' },
			{ label: '$(note) Edit description', value: 'description' },
			{ label: '$(refresh) Update with current layout', value: 'update-layout' },
		],
		{
			placeHolder: `Edit layout "${layout.name}"`,
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
 * Edits a layout's name
 */
async function editLayoutName(layout: TerminalLayout) {
	const newName = await vscode.window.showInputBox({
		prompt: 'Enter the new layout name',
		value: layout.name,
		validateInput: (value) => {
			if (!value || value.trim().length === 0) {
				return 'Layout name cannot be empty';
			}
			return null;
		},
	});

	if (!newName || newName === layout.name) {
		return;
	}

	// Check if a layout with this name already exists
	if (await storageService.layoutNameExists(newName, layout.id)) {
		vscode.window.showErrorMessage(`❌ A layout named "${newName}" already exists`);
		return;
	}

	await storageService.updateLayout(layout.id, { name: newName.trim() });
	vscode.window.showInformationMessage(`✅ Name updated to "${newName}"`);
}

/**
 * Edits a layout's description
 */
async function editLayoutDescription(layout: TerminalLayout) {
	const newDescription = await vscode.window.showInputBox({
		prompt: 'Enter the new layout description',
		value: layout.description,
	});

	if (newDescription === undefined) {
		return;
	}

	await storageService.updateLayout(layout.id, { description: newDescription.trim() });
	vscode.window.showInformationMessage('✅ Description updated successfully!');
}

/**
 * Updates a layout's structure with current terminals
 */
async function updateLayoutStructure(layout: TerminalLayout) {
	const currentGroups = terminalManager.captureCurrentLayout();
	const totalTerminals = currentGroups.reduce((sum, g) => sum + g.terminals.length, 0);

	if (totalTerminals === 0) {
		const action = await vscode.window.showWarningMessage(
			'⚠️ No open terminals. Do you want to clear the layout?',
			'Yes',
			'No'
		);

		if (action !== 'Yes') {
			return;
		}
	}

	// Ask user how to organize terminals into groups
	let groups: TerminalGroup[];
	
	if (totalTerminals > 0) {
		const organizedGroups = await organizeTerminalsIntoGroups(currentGroups[0].terminals);
		if (!organizedGroups) {
			return; // User cancelled
		}
		groups = organizedGroups;
	} else {
		groups = [];
	}

	await storageService.updateLayout(layout.id, { groups });
	const groupsInfo = groups.length === 1 ? '1 group' : `${groups.length} groups`;
	vscode.window.showInformationMessage(
		`✅ Layout updated! ${totalTerminals} terminal(s) in ${groupsInfo}.`
	);
}

/**
 * Creates a new layout from scratch with assisted interface
 */
async function createLayout() {
	try {
		vscode.window.showInformationMessage(
			'📝 Let\'s create a new layout! You can add terminal groups.'
		);

		// Request layout name
		const name = await vscode.window.showInputBox({
			prompt: 'Enter the layout name',
			placeHolder: 'Ex: Full Stack Development',
			validateInput: (value) => {
				if (!value || value.trim().length === 0) {
					return 'Layout name cannot be empty';
				}
				return null;
			},
		});

		if (!name) {
			return;
		}

		// Check if a layout with this name already exists
		if (await storageService.layoutNameExists(name)) {
			vscode.window.showErrorMessage(`❌ A layout named "${name}" already exists`);
			return;
		}

		// Request description (optional)
		const description = await vscode.window.showInputBox({
			prompt: 'Enter a description for the layout (optional)',
			placeHolder: 'Ex: Terminal for development with frontend and backend',
		});

	// Add terminals
	const terminals: TerminalConfig[] = [];
	let addMore = true;

	while (addMore) {
		const terminalName = await vscode.window.showInputBox({
			prompt: `Terminal ${terminals.length + 1}: Enter name`,
			placeHolder: 'Ex: Backend Server',
		});

		if (!terminalName) {
			break;
		}

		const profileName = await selectTerminalProfile();

		const command = await vscode.window.showInputBox({
			prompt: `Terminal "${terminalName}": Command to execute (optional)`,
			placeHolder: 'Ex: npm run dev',
		});

		const cwd = await vscode.window.showInputBox({
			prompt: `Terminal "${terminalName}": Working directory (optional)`,
			placeHolder: 'Ex: ./backend',
		});

		terminals.push({
			name: terminalName.trim(),
			profileName: profileName,
			command: command?.trim(),
			cwd: cwd?.trim(),
		});

		const action = await vscode.window.showQuickPick(
			['Add another terminal', 'Finish'],
			{
				placeHolder: `${terminals.length} terminal(s) added`,
			}
		);

		addMore = action === 'Add another terminal';
	}

		if (terminals.length === 0) {
			vscode.window.showWarningMessage('⚠️ No terminals added. Layout was not created.');
			return;
		}

		// Organize terminals into groups
		const groups = await organizeTerminalsIntoGroups(terminals);
		if (!groups) {
			return; // User cancelled
		}

		// Create layout
		const layout: TerminalLayout = {
			id: generateId(),
			name: name.trim(),
			description: description?.trim(),
			groups,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		// Save layout
		await storageService.saveLayout(layout);

		const groupsInfo = groups.length === 1 ? '1 group' : `${groups.length} groups`;
		vscode.window.showInformationMessage(
			`✅ Layout "${layout.name}" created! ${terminals.length} terminal(s) in ${groupsInfo}.`
		);
	} catch (error) {
		handleError('Error creating layout', error);
	}
}

/**
 * Allows the user to organize terminals into groups (split layout)
 * @param terminals List of terminals to be organized
 * @returns List of organized groups or undefined if cancelled
 */
async function organizeTerminalsIntoGroups(terminals: TerminalConfig[]): Promise<TerminalGroup[] | undefined> {
	if (terminals.length === 0) {
		return [];
	}

	if (terminals.length === 1) {
		// Only one terminal - one group
		return [{
			id: 0,
			terminals: [terminals[0]],
		}];
	}

	// Show the names of terminals to be organized
	const terminalNamesList = terminals.map((t, i) => {
		let info = `  ${i + 1}. ${t.name}`;
		if (t.profileName) {
			info += ` [${t.profileName}]`;
		}
		return info;
	}).join('\n');
	
	// Ask user how to organize
	const organizationMethod = await vscode.window.showQuickPick(
		[
			{
				label: '$(layout) Each terminal separate',
				description: `${terminals.length} independent terminals`,
				detail: `Will create: ${terminals.map(t => {
					const profile = t.profileName ? `(${t.profileName})` : '';
					return `[${t.name}${profile}]`;
				}).join(' ')}`,
				value: 'separate',
			},
			{
				label: '$(split-horizontal) All split (side by side)',
				description: `${terminals.length} terminals together`,
				detail: `Will create: [${terminals.map(t => {
					const profile = t.profileName ? `(${t.profileName})` : '';
					return `${t.name}${profile}`;
				}).join(' | ')}]`,
				value: 'together',
			},
			{
				label: '$(edit) Manually organize splits',
				description: 'You choose which ones stay side by side',
				detail: 'Define which terminals are split together',
				value: 'manual',
			},
		],
		{
			placeHolder: `⚠️ IMPORTANT: Define the SPLIT structure of captured terminals`,
			title: `Terminals: ${terminals.map(t => t.name).join(', ')}`,
		}
	);

	if (!organizationMethod) {
		return undefined;
	}

	switch (organizationMethod.value) {
		case 'separate':
			// Each terminal in its own group
			const separateGroups = terminals.map((terminal, index) => ({
				id: index,
				terminals: [terminal],
			}));
			console.log('🔷 SEPARATE organization created:', separateGroups.length, 'groups');
			separateGroups.forEach((g, i) => {
				console.log(`  Group ${i + 1}:`, g.terminals.map(t => t.name));
			});
			return separateGroups;

		case 'together':
			// All in one group
			const togetherGroup = [{
				id: 0,
				terminals: terminals,
			}];
			console.log('🔷 TOGETHER organization created: 1 group with', terminals.length, 'terminals');
			return togetherGroup;

		case 'manual':
			const manualGroups = await organizeTerminalsManually(terminals);
			if (manualGroups) {
				console.log('🔷 MANUAL organization created:', manualGroups.length, 'groups');
				manualGroups.forEach((g, i) => {
					console.log(`  Group ${i + 1}:`, g.terminals.map(t => t.name));
				});
			}
			return manualGroups;

		default:
			return undefined;
	}
}

/**
 * Allows the user to manually organize terminals into groups
 */
async function organizeTerminalsManually(terminals: TerminalConfig[]): Promise<TerminalGroup[] | undefined> {
	const groups: TerminalGroup[] = [];
	const availableTerminals = [...terminals];
	let groupId = 0;

	vscode.window.showInformationMessage(
		'💡 Terminals in the same group = SPLIT (side by side) | Different groups = SEPARATE'
	);

	while (availableTerminals.length > 0) {
		// Show available terminals
		const terminalItems = availableTerminals.map((terminal, index) => {
			let description = terminal.cwd || 'Captured terminal';
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
			? ` | ${groups.length} group(s) created` 
			: '';
		
		const selected = await vscode.window.showQuickPick(terminalItems, {
			placeHolder: `Group ${groupNumber}: Select terminals that will be SIDE BY SIDE (Ctrl+Click for multiple)${groupsCreatedInfo}`,
			canPickMany: true,
			title: `${availableTerminals.length} terminal(s) remaining to organize`,
		});

		if (!selected || selected.length === 0) {
			// If nothing selected and there are still terminals, create individual groups
			if (availableTerminals.length > 0) {
				const action = await vscode.window.showQuickPick(
					[
						{ label: 'Create individual groups for the rest', value: 'individual' },
						{ label: 'Cancel layout creation', value: 'cancel' },
					],
					{
						placeHolder: `${availableTerminals.length} terminal(s) still not grouped`,
					}
				);

				if (action?.value === 'individual') {
					// Create one group for each remaining terminal
					availableTerminals.forEach(terminal => {
						groups.push({
							id: groupId++,
							terminals: [terminal],
						});
					});
					break;
				} else {
					return undefined; // Cancel
				}
			}
			break;
		}

		// Create group with selected terminals
		const groupTerminals = selected.map(item => item.terminal);
		groups.push({
			id: groupId++,
			terminals: groupTerminals,
		});

		// Remove selected terminals from available list
		selected.forEach(item => {
			const index = availableTerminals.findIndex(t => t === item.terminal);
			if (index !== -1) {
				availableTerminals.splice(index, 1);
			}
		});

		// If there are still terminals, ask if want to add more groups
		if (availableTerminals.length > 0) {
			const continueAction = await vscode.window.showQuickPick(
				['Add another group', 'Finish (create individual groups for the rest)'],
				{
					placeHolder: `Group ${groupNumber} created with ${groupTerminals.length} terminal(s). ${availableTerminals.length} remaining.`,
				}
			);

			if (continueAction !== 'Add another group') {
				// Create one group for each remaining terminal
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
 * Gets available terminal profiles
 */
async function getAvailableTerminalProfiles(): Promise<Array<{ label: string; profileName: string | undefined }>> {
	// Get configured profiles
	const config = vscode.workspace.getConfiguration('terminal.integrated.profiles');
	const profiles: Array<{ label: string; profileName: string | undefined }> = [
		{ label: '$(terminal) System Default', profileName: undefined }
	];

	// Detect platform
	const platform = process.platform === 'win32' ? 'windows' : process.platform === 'darwin' ? 'osx' : 'linux';
	const platformProfiles = config.get<Record<string, any>>(platform);

	console.log(`🔍 Detecting terminal profiles (Platform: ${platform})`);
	
	if (platformProfiles) {
		console.log(`📋 Profiles found:`, Object.keys(platformProfiles));
		
		Object.keys(platformProfiles).forEach(profileName => {
			const profile = platformProfiles[profileName];
			console.log(`  - ${profileName}:`, {
				hasPath: !!profile.path,
				hasSource: !!profile.source,
				hasArgs: !!profile.args
			});
			
			// Add profile with appropriate icon
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
		console.log(`⚠️ No profiles found for platform ${platform}`);
	}

	return profiles;
}

/**
 * Allows the user to select a terminal profile
 */
async function selectTerminalProfile(): Promise<string | undefined> {
	const profiles = await getAvailableTerminalProfiles();
	
	const selected = await vscode.window.showQuickPick(profiles, {
		placeHolder: 'Select terminal profile (optional)',
		title: 'Terminal Profile'
	});

	return selected?.profileName;
}

/**
 * Generates a unique ID
 */
function generateId(): string {
	return crypto.randomBytes(16).toString('hex');
}

/**
 * Handles errors centrally
 */
function handleError(message: string, error: any) {
	console.error(message, error);
	vscode.window.showErrorMessage(`${message}: ${error.message || error}`);
}

/**
 * Deactivates the extension
 */
export function deactivate() {
	console.log('👋 MFA Terminal extension deactivated');
}
