/**
 * Tipos e interfaces para a extensão MFA Terminal
 */

/**
 * Configuração individual de um terminal
 */
export interface TerminalConfig {
	/** Nome do terminal */
	name: string;
	/** Diretório de trabalho (opcional) */
	cwd?: string;
	/** Comando a ser executado após abrir o terminal (opcional) */
	command?: string;
	/** Variáveis de ambiente (opcional) */
	env?: { [key: string]: string };
	/** Ícone do terminal (opcional) */
	icon?: string;
	/** Cor do terminal (opcional) */
	color?: string;
	/** ID do grupo ao qual este terminal pertence */
	groupId?: number;
	/** Índice dentro do grupo (para ordem de splits) */
	indexInGroup?: number;
}

/**
 * Grupo de terminais (terminais splitados juntos)
 */
export interface TerminalGroup {
	/** ID único do grupo */
	id: number;
	/** Terminais neste grupo */
	terminals: TerminalConfig[];
}

/**
 * Layout de terminal
 */
export interface TerminalLayout {
	/** Identificador único do layout */
	id: string;
	/** Nome do layout */
	name: string;
	/** Descrição do layout (opcional) */
	description?: string;
	/** Grupos de terminais (cada grupo representa terminais splitados) */
	groups: TerminalGroup[];
	/** Data de criação */
	createdAt: Date;
	/** Data da última modificação */
	updatedAt: Date;
}

/**
 * Compatibilidade com layouts antigos (sem grupos)
 */
export interface LegacyTerminalLayout {
	id: string;
	name: string;
	description?: string;
	terminals: TerminalConfig[];
	createdAt: Date;
	updatedAt: Date;
}

/**
 * Armazenamento de layouts
 */
export interface LayoutStorage {
	/** Versão do formato de armazenamento */
	version: string;
	/** Mapa de layouts por ID */
	layouts: { [id: string]: TerminalLayout };
}

