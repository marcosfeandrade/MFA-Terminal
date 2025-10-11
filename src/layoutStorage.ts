/**
 * Serviço de armazenamento de layouts de terminal
 */

import * as vscode from 'vscode';
import { TerminalLayout, LayoutStorage, LegacyTerminalLayout, TerminalGroup } from './types';

const STORAGE_VERSION = '2.0.0';
const STORAGE_KEY = 'mfa-terminal.layouts';

/**
 * Gerenciador de armazenamento de layouts
 */
export class LayoutStorageService {
	constructor(private context: vscode.ExtensionContext) {}

	/**
	 * Obtém todos os layouts salvos
	 */
	async getAllLayouts(): Promise<TerminalLayout[]> {
		const storage = await this.getStorage();
		return Object.values(storage.layouts).map(this.deserializeLayout);
	}

	/**
	 * Obtém um layout específico por ID
	 */
	async getLayout(id: string): Promise<TerminalLayout | undefined> {
		const storage = await this.getStorage();
		const layout = storage.layouts[id];
		return layout ? this.deserializeLayout(layout) : undefined;
	}

	/**
	 * Salva um novo layout
	 */
	async saveLayout(layout: TerminalLayout): Promise<void> {
		const storage = await this.getStorage();
		storage.layouts[layout.id] = this.serializeLayout(layout);
		await this.setStorage(storage);
	}

	/**
	 * Atualiza um layout existente
	 */
	async updateLayout(id: string, updates: Partial<TerminalLayout>): Promise<void> {
		const storage = await this.getStorage();
		const existingLayout = storage.layouts[id];
		
		if (!existingLayout) {
			throw new Error(`Layout com ID ${id} não encontrado`);
		}

		const updatedLayout: TerminalLayout = {
			...this.deserializeLayout(existingLayout),
			...updates,
			id, // Garantir que o ID não mude
			updatedAt: new Date(),
		};

		storage.layouts[id] = this.serializeLayout(updatedLayout);
		await this.setStorage(storage);
	}

	/**
	 * Remove um layout
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
	 * Verifica se existe um layout com o nome especificado
	 */
	async layoutNameExists(name: string, excludeId?: string): Promise<boolean> {
		const layouts = await this.getAllLayouts();
		return layouts.some(l => l.name === name && l.id !== excludeId);
	}

	/**
	 * Obtém o armazenamento completo
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
	 * Salva o armazenamento completo
	 */
	private async setStorage(storage: LayoutStorage): Promise<void> {
		await this.context.globalState.update(STORAGE_KEY, storage);
	}

	/**
	 * Serializa um layout para armazenamento
	 */
	private serializeLayout(layout: TerminalLayout): any {
		return {
			...layout,
			createdAt: layout.createdAt.toISOString(),
			updatedAt: layout.updatedAt.toISOString(),
		};
	}

	/**
	 * Deserializa um layout do armazenamento
	 * Suporta migração de layouts antigos (v1) para o novo formato (v2)
	 */
	private deserializeLayout(layout: any): TerminalLayout {
		// Verificar se é um layout antigo (sem grupos)
		if (layout.terminals && !layout.groups) {
			// Migrar layout antigo para o novo formato
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

		// Layout no formato novo
		return {
			...layout,
			createdAt: new Date(layout.createdAt),
			updatedAt: new Date(layout.updatedAt),
		};
	}
}

