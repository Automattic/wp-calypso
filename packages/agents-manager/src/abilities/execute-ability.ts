import { findAbilityByName } from './ability-name';
import type { Ability } from './types';

/**
 * Finds an ability by its raw or normalized name and runs its callback.
 * Failures — including unknown names — log and rethrow so the chat surfaces
 * the error.
 */
export async function executeAbilityFromList(
	abilities: Ability[],
	name: string,
	args: unknown
): Promise< unknown > {
	try {
		const ability = findAbilityByName( abilities, name );
		if ( ! ability?.callback ) {
			throw new Error( `Agents Manager does not own the ability: ${ name }` );
		}
		return await ability.callback( args );
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.error( `[AgentsManager] Ability "${ name }" failed:`, error );
		throw error;
	}
}
