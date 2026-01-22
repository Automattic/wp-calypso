/**
 * Tool Provider for Image Studio
 *
 * Provides the image studio abilities to the AI agent.
 */

import { getAbilities, executeAbility } from '@wordpress/abilities';
import type { ToolProvider as AgentticToolProvider } from '@automattic/agenttic-client';
import { registerUpdateCanvasImageAbility } from '../abilities';

/**
 * Allowed abilities that Image Studio exposes to the agent
 */
const ALLOWED_ABILITIES = [ 'image-studio/update-canvas-image', 'image-studio/render-images' ];

// Track initialization state
let isInitialized = false;

/**
 * Initialize Image Studio abilities
 * Registers all required abilities with the WordPress Abilities API
 */
async function initializeAbilities(): Promise< void > {
	if ( isInitialized ) {
		return;
	}

	await registerUpdateCanvasImageAbility();
	isInitialized = true;

	// eslint-disable-next-line no-console
	console.log( '[Image Studio] Abilities registered' );
}

/**
 * Create a tool provider for Image Studio
 *
 * The tool provider exposes abilities to the agent and handles their execution.
 */
export function createToolProvider(): AgentticToolProvider {
	return {
		async getAbilities() {
			// Ensure abilities are registered
			await initializeAbilities();

			// Get all registered abilities and filter to allowed list
			const allAbilities = await getAbilities();
			const filtered = allAbilities.filter(
				( ability ) => ability?.name && ALLOWED_ABILITIES.includes( ability.name )
			);

			// eslint-disable-next-line no-console
			console.log(
				'[Image Studio] Available abilities:',
				filtered.map( ( a ) => a.name )
			);

			return filtered;
		},

		async executeAbility( name: string, args: any ) {
			// Ensure abilities are registered
			await initializeAbilities();

			// Validate ability is allowed
			if ( ! ALLOWED_ABILITIES.includes( name ) ) {
				throw new Error( `Ability '${ name }' is not allowed for Image Studio` );
			}

			// eslint-disable-next-line no-console
			console.log( `[Image Studio] Executing ability: ${ name }`, args );

			return executeAbility( name, args );
		},
	};
}
