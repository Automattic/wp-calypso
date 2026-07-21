/**
 * Types for plugin extensions to the AI Agents system.
 *
 * These types allow external plugins (like Big Sky, CIAB Admin) to extend
 * the wp-calypso orchestrator agent with custom abilities and context.
 */

import type { Ability } from './abilities/types';

/**
 * Re-export `Ability` for use by external plugins.
 */
export type { Ability } from './abilities/types';

/**
 * Tool Provider Interface
 *
 * Allows plugins to provide abilities that the agent can execute.
 * Integrates with the WordPress Abilities API (`@wordpress/abilities`).
 */
export interface ToolProvider {
	/**
	 * Get all available abilities.
	 * Plugins should filter to only return allowed abilities.
	 */
	getAbilities: () => Promise< Ability[] >;

	/**
	 * Execute a specific ability by name.
	 * @param name - The ability name (e.g., `my-plugin/my-ability`).
	 * @param args - Arguments to pass to the ability.
	 */
	executeAbility: ( name: string, args: any ) => Promise< any >;
}

/**
 * Context Provider Interface
 *
 * Allows plugins to provide rich context about the current environment,
 * including navigation state, entity data, and sitemap information.
 */
export interface ContextProvider {
	/**
	 * Get the current client context.
	 */
	getClientContext: () => ClientContextType;
}

/**
 * Client Context Type
 *
 * Rich context information provided to the agent by plugins.
 */
export interface ClientContextType {
	/**
	 * Current page URL
	 */
	url: string;

	/**
	 * Current pathname
	 */
	pathname: string;

	/**
	 * URL search/query string
	 */
	search: string;

	/**
	 * Environment identifier
	 */
	environment:
		| 'wp-admin'
		| 'ciab-admin'
		| 'calypso'
		| 'wp-admin-disconnected'
		| 'gutenberg-disconnected'
		| 'ciab-disconnected'
		| string;

	/**
	 * Optional context entries (sitemap, entities, etc.).
	 * These use lazy evaluation via `getData` closures.
	 */
	contextEntries?: ContextEntry[];

	/**
	 * Allow additional properties for environment-specific data
	 */
	[ key: string ]: any;
}

/**
 * Base interface for all context entries
 *
 * Plugins can extend this interface to create their own context entry types
 * with specific data structures for their environment (e.g., sitemap, entities, etc.)
 */
export interface BaseContextEntry {
	/**
	 * Unique identifier for this context entry
	 */
	id: string;

	/**
	 * Type discriminator
	 */
	type: string;

	/**
	 * Optional lazy data loader
	 * If provided, will be called to populate the data field
	 */
	getData?: () => any;

	/**
	 * Optional resolved data
	 * Populated after `getData()` is called
	 */
	data?: any;
}

/**
 * Union type for context entries.
 *
 * Plugins should define their own types extending `BaseContextEntry`:
 *
 *     interface MySitemapEntry extends BaseContextEntry {
 *       id: 'sitemap';
 *       type: 'sitemap';
 *       data?: { menuItems: MenuItem[] };
 *     }
 */
export type ContextEntry = BaseContextEntry;

// Re-export Suggestion from agenttic-ui for convenience
export type { Suggestion } from '@automattic/agenttic-ui';

/**
 * Big Sky Message Format
 *
 * Message format used by Big Sky when calling addMessage.
 * This is transformed to UIMessage format by the agents-manager.
 */
export interface BigSkyMessage {
	/**
	 * Unique message identifier
	 */
	id: string;

	/**
	 * Message role - Big Sky uses 'assistant', transformed to 'agent' for UI
	 */
	role: 'user' | 'assistant';

	/**
	 * Message content array
	 */
	content: Array< {
		type: 'text' | 'component' | 'context';
		text?: string;
		component?: React.ComponentType;
		componentProps?: Record< string, unknown >;
	} >;

	/**
	 * Unix timestamp in seconds (converted to milliseconds for UI)
	 */
	created_at: number;

	/**
	 * Optional: whether message is archived (defaults to false)
	 */
	archived?: boolean;

	/**
	 * Optional: whether to show icon (defaults to true)
	 */
	showIcon?: boolean;
}
