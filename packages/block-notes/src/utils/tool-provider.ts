/**
 * Tool Provider for Block Notes
 *
 * Provides the block notes ability to the AI agent.
 */
import { getAbilities, executeAbility } from '@wordpress/abilities';
import { registerBlockNotesAbility, ABILITY_NAME } from '../abilities';
import type { Ability, ToolProvider } from '@automattic/agents-manager/src/extension-types';

export const ALLOWED_ABILITIES = [ ABILITY_NAME ];

let isInitialized = false;

export async function initializeAbilities(): Promise< void > {
	if ( isInitialized ) {
		return;
	}

	await registerBlockNotesAbility();
	isInitialized = true;

	window.console?.log?.( '[Block Notes] Abilities registered' );
}

export async function getFilteredAbilities(): Promise< Ability[] > {
	await initializeAbilities();

	const allAbilities = await getAbilities();
	return allAbilities.filter(
		( ability ) => ability?.name && ALLOWED_ABILITIES.includes( ability.name )
	);
}

export async function executeFilteredAbility( name: string, args: any ): Promise< any > {
	await initializeAbilities();

	if ( ! ALLOWED_ABILITIES.includes( name ) ) {
		throw new Error( `Ability '${ name }' is not allowed for Block Notes` );
	}

	return executeAbility( name, args );
}

export function createToolProvider(): ToolProvider {
	return {
		getAbilities: getFilteredAbilities,
		executeAbility: executeFilteredAbility,
	};
}
