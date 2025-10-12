/**
 * Terminal layout storage service
 */

import * as vscode from 'vscode';
import { TerminalLayout, LayoutStorage, LegacyTerminalLayout, TerminalGroup } from './types';

const STORAGE_VERSION = '2.0.0';
const STORAGE_KEY = 'mfa-terminal.layouts';

/**
 * Layout storage manager
 */
export class LayoutStorageService {
	constructor(private context: vscode.ExtensionContext) {}

	/**
	 * Gets all saved layouts
	 */
	async getAllLayouts(): Promise<TerminalLayout[]> {
		const storage = await this.getStorage();
		return Object.values(storage.layouts).map(this.deserializeLayout);
	}

	/**
	 * Gets a specific layout by ID
	 */
	async getLayout(id: string): Promise<TerminalLayout | undefined> {
		const storage = await this.getStorage();
		const layout = storage.layouts[id];
		return layout ? this.deserializeLayout(layout) : undefined;
	}

	/**
	 * Saves a new layout
	 */
	async saveLayout(layout: TerminalLayout): Promise<void> {
		const storage = await this.getStorage();
		storage.layouts[layout.id] = this.serializeLayout(layout);
		await this.setStorage(storage);
	}

	/**
	 * Updates an existing layout
	 */
	async updateLayout(id: string, updates: Partial<TerminalLayout>): Promise<void> {
		const storage = await this.getStorage();
		const existingLayout = storage.layouts[id];
		
		if (!existingLayout) {
			throw new Error(`Layout with ID ${id} not found`);
		}

		const updatedLayout: TerminalLayout = {
			...this.deserializeLayout(existingLayout),
			...updates,
			id, // Ensure ID doesn't change
			updatedAt: new Date(),
		};

		storage.layouts[id] = this.serializeLayout(updatedLayout);
		await this.setStorage(storage);
	}

	/**
	 * Removes a layout
	 */
	async deleteLayout(id: string): Promise<boolean> {
		const storage = await this.getStorage();
		
		if (!storage.layouts[id]) {
			return false;
		}

		delete storage.layouts[id];
		await this.setStorage(storage);
		return true;
	}

	/**
	 * Checks if a layout with the specified name exists
	 */
	async layoutNameExists(name: string, excludeId?: string): Promise<boolean> {
		const layouts = await this.getAllLayouts();
		return layouts.some(l => l.name === name && l.id !== excludeId);
	}

	/**
	 * Gets the complete storage
	 */
	private async getStorage(): Promise<LayoutStorage> {
		const data = await this.context.globalState.get<LayoutStorage>(STORAGE_KEY);
		
		if (!data) {
			return {
				version: STORAGE_VERSION,
				layouts: {},
			};
		}

		return data;
	}

	/**
	 * Saves the complete storage
	 */
	private async setStorage(storage: LayoutStorage): Promise<void> {
		await this.context.globalState.update(STORAGE_KEY, storage);
	}

	/**
	 * Serializes a layout for storage
	 */
	private serializeLayout(layout: TerminalLayout): any {
		return {
			...layout,
			createdAt: layout.createdAt.toISOString(),
			updatedAt: layout.updatedAt.toISOString(),
		};
	}

	/**
	 * Deserializes a layout from storage
	 * Supports migration of old layouts (v1) to new format (v2)
	 */
	private deserializeLayout(layout: any): TerminalLayout {
		// Check if it's an old layout (without groups)
		if (layout.terminals && !layout.groups) {
			// Migrate old layout to new format
			const group: TerminalGroup = {
				id: 0,
				terminals: layout.terminals,
			};

			return {
				id: layout.id,
				name: layout.name,
				description: layout.description,
				groups: [group],
				createdAt: new Date(layout.createdAt),
				updatedAt: new Date(layout.updatedAt),
			};
		}

		// Layout in new format
		return {
			...layout,
			createdAt: new Date(layout.createdAt),
			updatedAt: new Date(layout.updatedAt),
		};
	}
}

