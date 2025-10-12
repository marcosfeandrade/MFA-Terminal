/**
 * Types and interfaces for the MFA Terminal extension
 */

/**
 * Individual terminal configuration
 */
export interface TerminalConfig {
	/** Terminal name */
	name: string;
	/** Working directory (optional) */
	cwd?: string;
	/** Command to be executed after opening the terminal (optional) */
	command?: string;
	/** Environment variables (optional) */
	env?: { [key: string]: string };
	/** Terminal icon (optional) */
	icon?: string;
	/** Terminal color (optional) */
	color?: string;
	/** Terminal profile (ex: Git Bash, PowerShell, CMD, etc.) (optional) */
	profileName?: string;
	/** ID of the group this terminal belongs to */
	groupId?: number;
	/** Index within the group (for split order) */
	indexInGroup?: number;
}

/**
 * Terminal group (split terminals together)
 */
export interface TerminalGroup {
	/** Unique group ID */
	id: number;
	/** Terminals in this group */
	terminals: TerminalConfig[];
}

/**
 * Terminal layout
 */
export interface TerminalLayout {
	/** Unique layout identifier */
	id: string;
	/** Layout name */
	name: string;
	/** Layout description (optional) */
	description?: string;
	/** Terminal groups (each group represents split terminals) */
	groups: TerminalGroup[];
	/** Creation date */
	createdAt: Date;
	/** Last modification date */
	updatedAt: Date;
}

/**
 * Compatibility with old layouts (without groups)
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
 * Layout storage
 */
export interface LayoutStorage {
	/** Storage format version */
	version: string;
	/** Layout map by ID */
	layouts: { [id: string]: TerminalLayout };
}

