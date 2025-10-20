/**
 * Terminal manager
 */

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { TerminalLayout, TerminalConfig, TerminalGroup } from './types';

/**
 * Terminal creation and control manager
 */
export class TerminalManager {
	/**
	 * Applies a terminal layout, creating configured terminals with their groups
	 */
	async applyLayout(layout: TerminalLayout, closeExisting: boolean = false): Promise<void> {
		console.log('🚀 Applying layout:', layout.name);
		console.log('📊 Groups in layout:', layout.groups);
		
		// Close existing terminals if requested
		if (closeExisting) {
			this.closeAllTerminals();
		}

		// Total terminal counter
		let totalTerminals = 0;

		// Create each terminal group
		for (let i = 0; i < layout.groups.length; i++) {
			const group = layout.groups[i];
			console.log(`📁 Creating group ${i + 1}:`, group.terminals.map(t => t.name));
			await this.createTerminalGroup(group);
			totalTerminals += group.terminals.length;
		}

		// Show success message
		const groupsInfo = layout.groups.length === 1 
			? '1 group' 
			: `${layout.groups.length} groups`;
		
		vscode.window.showInformationMessage(
			`✅ Layout "${layout.name}" applied! ${totalTerminals} terminal(s) in ${groupsInfo}.`
		);
	}

	/**
	 * Creates a terminal group (split terminals together)
	 */
	private async createTerminalGroup(group: TerminalGroup): Promise<void> {
		if (group.terminals.length === 0) {
			return;
		}

		// Create first terminal in group
		console.log(`  🔨 Creating terminal 1/${group.terminals.length}: "${group.terminals[0].name}"`);
		const firstTerminal = await this.createTerminalSimple(group.terminals[0]);
		
		// Show terminal to ensure it's active
		firstTerminal.show();
		await this.delay(500);

		// For each additional terminal, split
		for (let i = 1; i < group.terminals.length; i++) {
			const terminalConfig = group.terminals[i];
			console.log(`  🔨 Creating terminal ${i + 1}/${group.terminals.length}: "${terminalConfig.name}"`);
			console.log(`    ↪️ Attempting split with "${firstTerminal.name}"`);
			
			// Focus on first terminal before splitting
			firstTerminal.show();
			await this.delay(200);
			
			// Execute split command
			await vscode.commands.executeCommand('workbench.action.terminal.split');
			await this.delay(300);
			
			// The split terminal is the last active terminal
			const terminals = vscode.window.terminals;
			const newTerminal = terminals[terminals.length - 1];
			
		if (newTerminal) {
			console.log(`    ✅ Split terminal created, renaming to "${terminalConfig.name}"`);
			
			// Rename terminal
			await vscode.commands.executeCommand('workbench.action.terminal.renameWithArg', {
				name: terminalConfig.name
			});
			
		// Change directory if specified (split inherits parent directory)
		if (terminalConfig.cwd) {
			const resolvedPath = this.resolvePath(terminalConfig.cwd);
			if (resolvedPath) {
				await this.delay(300);
				console.log(`    📁 Changing directory to: ${resolvedPath}`);
				
				// For Windows, check if we need to change drive first
				if (process.platform === 'win32' && resolvedPath.match(/^[A-Za-z]:/)) {
					const drive = resolvedPath.substring(0, 2); // Ex: "C:"
					// Send drive change command first (works in CMD and PowerShell)
					newTerminal.sendText(drive);
					await this.delay(100);
				}
				
				// Then send cd command (works universally)
				newTerminal.sendText(`cd "${resolvedPath}"`);
			}
		}
			
			// Execute command if specified
			if (terminalConfig.command) {
				await this.delay(300);
				newTerminal.sendText(terminalConfig.command);
			}
		}
			
			await this.delay(200);
		}
	}

	/**
	 * Creates a simple terminal without split (used for the first terminal in the group)
	 */
	private async createTerminalSimple(config: TerminalConfig): Promise<vscode.Terminal> {
		let terminal: vscode.Terminal;

		// If a profile was specified, create terminal with that profile
		if (config.profileName) {
			console.log(`🎯 Attempting to create terminal "${config.name}" with profile "${config.profileName}"`);
			
			// Use VS Code internal command to create terminal with profile
			// This ensures the profile is applied correctly
			const terminalCountBefore = vscode.window.terminals.length;
			
			try {
				// First, temporarily set the default profile
				const platform = process.platform === 'win32' ? 'windows' : process.platform === 'darwin' ? 'osx' : 'linux';
				const defaultProfileKey = `terminal.integrated.defaultProfile.${platform}`;
				const currentDefault = vscode.workspace.getConfiguration().get(defaultProfileKey);
				
				console.log(`📝 Current default profile: ${currentDefault}`);
				console.log(`🔄 Temporarily changing default profile to: ${config.profileName}`);
				
				// Temporarily change default profile
				await vscode.workspace.getConfiguration().update(
					defaultProfileKey,
					config.profileName,
					vscode.ConfigurationTarget.Global
				);
				
				await this.delay(100);
				
			// Create terminal with profile
			const terminalOptions: vscode.TerminalOptions = {
				name: config.name,
				env: config.env,
			};
			
			// Add cwd if specified
			if (config.cwd) {
				const resolvedPath = this.resolvePath(config.cwd);
				if (resolvedPath && fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isDirectory()) {
					terminalOptions.cwd = resolvedPath;
				}
			}

			// Add icon if specified
			if (config.icon) {
				terminalOptions.iconPath = new vscode.ThemeIcon(config.icon);
			}

			// Add color if specified
			if (config.color) {
				terminalOptions.color = new vscode.ThemeColor(config.color);
			}
				
				console.log(`✅ Creating terminal with options:`, terminalOptions);
				terminal = vscode.window.createTerminal(terminalOptions);
				
				await this.delay(200);
				
				// Restore original default profile
				console.log(`🔙 Restoring default profile to: ${currentDefault || 'null'}`);
				await vscode.workspace.getConfiguration().update(
					defaultProfileKey,
					currentDefault,
					vscode.ConfigurationTarget.Global
				);
				
				console.log(`✅ Terminal created successfully!`);
				
			} catch (error) {
				console.error(`❌ Error creating terminal with profile:`, error);
				vscode.window.showWarningMessage(
					`⚠️ Error creating terminal "${config.name}" with profile "${config.profileName}". Using default profile.`
				);
				// Fallback to create without profile
				terminal = await this.createTerminalWithoutProfile(config);
			}
		} else {
			// Create terminal without specific profile (uses default)
			terminal = await this.createTerminalWithoutProfile(config);
		}
		
		// Execute command if specified
		if (config.command) {
			await this.delay(500);
			terminal.sendText(config.command);
		}

		return terminal;
	}

	/**
	 * Creates a terminal without specific profile (uses default settings)
	 */
	private async createTerminalWithoutProfile(config: TerminalConfig): Promise<vscode.Terminal> {
		const terminalOptions: vscode.TerminalOptions = {
			name: config.name,
			env: config.env,
		};

		// Resolve and validate working directory
		if (config.cwd) {
			const resolvedPath = this.resolvePath(config.cwd);
			
			if (resolvedPath) {
				if (fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isDirectory()) {
					terminalOptions.cwd = resolvedPath;
				} else {
					vscode.window.showErrorMessage(
						`⚠️ Terminal "${config.name}": Directory "${config.cwd}" does not exist.`
					);
				}
			}
		}

		// Add icon if specified
		if (config.icon) {
			terminalOptions.iconPath = new vscode.ThemeIcon(config.icon);
		}

		// Add color if specified
		if (config.color) {
			terminalOptions.color = new vscode.ThemeColor(config.color);
		}

		return vscode.window.createTerminal(terminalOptions);
	}

	/**
	 * Creates a single terminal based on configuration
	 * @param config Terminal configuration
	 * @param parentTerminal Parent terminal for splitting (optional)
	 * @deprecated Use createTerminalSimple instead
	 */
	private async createTerminal(config: TerminalConfig, parentTerminal?: vscode.Terminal): Promise<vscode.Terminal> {
		const terminalOptions: vscode.TerminalOptions = {
			name: config.name,
			env: config.env,
		};

		// Resolve and validate working directory
		if (config.cwd) {
			const resolvedPath = this.resolvePath(config.cwd);
			
			if (resolvedPath) {
				// Check if directory exists
				if (fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isDirectory()) {
					terminalOptions.cwd = resolvedPath;
				} else {
					// Show error and don't create terminal with invalid cwd
					vscode.window.showErrorMessage(
						`⚠️ Terminal "${config.name}": Directory "${config.cwd}" does not exist. Terminal will be created in default directory.`
					);
					// Don't add cwd, let terminal use default
				}
			}
		}

		// Add icon if specified
		if (config.icon) {
			terminalOptions.iconPath = new vscode.ThemeIcon(config.icon);
		}

		// Add color if specified
		if (config.color) {
			terminalOptions.color = new vscode.ThemeColor(config.color);
		}

		// If there's a parent terminal, split
		if (parentTerminal) {
			console.log(`      🔗 Setting location with parentTerminal: "${parentTerminal.name}"`);
			terminalOptions.location = { parentTerminal: parentTerminal };
		}

		// Create terminal
		console.log(`      ⚙️ Creating terminal with options:`, {
			name: terminalOptions.name,
			hasLocation: !!terminalOptions.location,
			hasCwd: !!terminalOptions.cwd,
		});
		
		const terminal = vscode.window.createTerminal(terminalOptions);
		
		console.log(`      ✅ Terminal created: "${terminal.name}"`);

		// Show terminal to ensure it's rendered
		if (!parentTerminal) {
			// Only show the first terminal in the group
			terminal.show(false); // false = don't steal focus
		}

		// Execute command if specified
		if (config.command) {
			// Wait a bit for terminal to initialize
			await this.delay(500);
			terminal.sendText(config.command);
		}

		return terminal;
	}

	/**
	 * Resolves environment variables in a path
	 * Ex: ${env:windir}\\System32 -> C:\\Windows\\System32
	 */
	private resolveEnvVars(pathStr: string): string {
		if (!pathStr) {
			return pathStr;
		}

		// Replace environment variables in ${env:VAR} format
		return pathStr.replace(/\$\{env:([^}]+)\}/gi, (_, varName) => {
			return process.env[varName] || '';
		});
	}

	/**
	 * Resolves a relative or absolute path in relation to the workspace
	 */
	private resolvePath(pathStr: string): string | undefined {
		// If absolute path, return directly
		if (path.isAbsolute(pathStr)) {
			return pathStr;
		}

		// Try to resolve in relation to current workspace
		const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
		
		if (workspaceFolder) {
			return path.resolve(workspaceFolder.uri.fsPath, pathStr);
		}

		// If no workspace, show warning
		vscode.window.showWarningMessage(
			'⚠️ No workspace open. Cannot resolve relative paths.'
		);
		
		return undefined;
	}

	/**
	 * Captures the current terminal layout
	 * Returns a structure of groups with terminals
	 * Note: VS Code API does not expose group information directly,
	 * so we return all terminals in a single group
	 */
	captureCurrentLayout(): TerminalGroup[] {
		const terminals = vscode.window.terminals;
		
		console.log('📊 Total terminals in VS Code:', terminals.length);
		
		const terminalConfigs: TerminalConfig[] = terminals.map((terminal, index) => {
			console.log(`  Terminal ${index + 1}: "${terminal.name}"`);
			
			const config: TerminalConfig = {
				name: terminal.name,
			};

			// Note: Unfortunately, the VS Code API does not allow reading
			// the current directory, executed commands, or environment variables
			// from existing terminals. These need to be configured manually.

			return config;
		});

		console.log('✅ Terminals captured:', terminalConfigs.length);

		// Return all in a single group
		// User can reorganize manually later
		return [{
			id: 0,
			terminals: terminalConfigs,
		}];
	}

	/**
	 * Closes all open terminals
	 */
	private closeAllTerminals(): void {
		const terminals = vscode.window.terminals;
		terminals.forEach(terminal => terminal.dispose());
	}

	/**
	 * Waits for a specified time
	 */
	private delay(ms: number): Promise<void> {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	/**
	 * Gets the number of open terminals
	 */
	getOpenTerminalsCount(): number {
		return vscode.window.terminals.length;
	}
}

