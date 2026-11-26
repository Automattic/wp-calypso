/**
 * Tool Provider for Image Studio
 *
 * Provides the image studio abilities to the AI agent.
 */
import { getAbilities, executeAbility } from '@wordpress/abilities';
import { registerUpdateCanvasImageAbility } from '../abilities';
import type { ToolProvider as AgentticToolProvider } from '@automattic/agenttic-client';

export const ALLOWED_ABILITIES = [
	'image-studio/update-canvas-image',
	'image-studio/render-images',
];

let isInitialized = false;

export async function initializeAbilities(): Promise< void > {
	if ( isInitialized ) {
		return;
	}

	await registerUpdateCanvasImageAbility();
	isInitialized = true;

	window.console?.log?.( '[Image Studio] Abilities registered' );
}

export async function getFilteredAbilities(): Promise< ReturnType< typeof getAbilities > > {
	await initializeAbilities();

	const allAbilities = await getAbilities();
	const filtered = allAbilities.filter(
		( ability ) => ability?.name && ALLOWED_ABILITIES.includes( ability.name )
	);

	window.console?.log?.(
		'[Image Studio] Available abilities:',
		filtered.map( ( a ) => a.name )
	);

	return filtered;
}

export async function executeFilteredAbility( name: string, args: any ): Promise< any > {
	await initializeAbilities();

	if ( ! ALLOWED_ABILITIES.includes( name ) ) {
		throw new Error( `Ability '${ name }' is not allowed for Image Studio` );
	}

	window.console?.log?.( `[Image Studio] Executing ability: ${ name }`, args );

	return executeAbility( name, args );
}

export function createToolProvider(): AgentticToolProvider {
	return {
		getAbilities: getFilteredAbilities,
		executeAbility: executeFilteredAbility,
	};
}
