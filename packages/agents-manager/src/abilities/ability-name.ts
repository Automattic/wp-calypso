import type { Ability } from './types';

// The agent routes tool calls with `/` → `__` and `-` → `_`.
const normalizeAbilityName = ( name: string ) => name.replace( /\//g, '__' ).replace( /-/g, '_' );

/**
 * Finds an ability by its raw or agent-normalized name — the one matching
 * rule for both execution and ownership checks.
 */
export function findAbilityByName( abilities: Ability[], name: string ): Ability | undefined {
	return abilities.find(
		( ability ) => ability.name === name || normalizeAbilityName( ability.name ) === name
	);
}
