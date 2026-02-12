/**
 * Image Studio Provider Exports
 *
 * Exports the tool and context providers for Image Studio integration
 * with the agents-manager dynamic loading system.
 */

import { getAbilities, executeAbility } from '@wordpress/abilities';
import { registerUpdateCanvasImageAbility } from '../abilities';
import type { ToolProvider, ContextProvider, ClientContextType } from '@automattic/agents-manager';

/**
 * Allowed abilities that Image Studio exposes to the agent
 */
const ALLOWED_ABILITIES = [ 'image-studio/update-canvas-image', 'image-studio/render-images' ];

/**
 * Initialize Image Studio abilities
 * Registers all required abilities with the WordPress Abilities API
 */
async function initializeAbilities(): Promise< void > {
	await registerUpdateCanvasImageAbility();
}

// Track initialization state
let isInitialized = false;

/**
 * Tool Provider implementation for Image Studio
 *
 * Provides the image studio abilities to the agent.
 */
export const toolProvider: ToolProvider = {
	async getAbilities() {
		// Ensure abilities are registered
		if ( ! isInitialized ) {
			await initializeAbilities();
			isInitialized = true;
		}

		// Get all registered abilities and filter to allowed list
		const allAbilities = await getAbilities();
		return allAbilities.filter(
			( ability ) => ability?.name && ALLOWED_ABILITIES.includes( ability.name )
		);
	},

	async executeAbility( name: string, args: any ) {
		// Ensure abilities are registered
		if ( ! isInitialized ) {
			await initializeAbilities();
			isInitialized = true;
		}

		// Validate ability is allowed
		if ( ! ALLOWED_ABILITIES.includes( name ) ) {
			throw new Error( `Ability '${ name }' is not allowed for Image Studio` );
		}

		return executeAbility( name, args );
	},
};

/**
 * Context Provider implementation for Image Studio
 *
 * Provides context about the current Image Studio state to the agent.
 */
export const contextProvider: ContextProvider = {
	getClientContext(): ClientContextType {
		return {
			url: window.location.href,
			pathname: window.location.pathname,
			search: window.location.search,
			environment: 'image-studio',
			contextEntries: [],
		};
	},
};

// Export for explicit initialization
export { initializeAbilities };
