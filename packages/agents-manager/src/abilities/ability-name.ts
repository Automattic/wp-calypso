import type { Ability } from './types';

/**
 * The agent routes tool calls with `/` → `__` and `-` → `_`, so an ability
 * registered as `big-sky/apply-block-edits` is invoked as
 * `big_sky__apply_block_edits`. Anything matching an ability by name — execution,
 * ownership checks, the editor-target guard — has to normalize both sides.
 */
export const normalizeAbilityName = ( name: string ) =>
	name.replace( /\//g, '__' ).replace( /-/g, '_' );

/**
 * Finds an ability by its raw or agent-normalized name — the one matching
 * rule for both execution and ownership checks.
 */
export function findAbilityByName( abilities: Ability[], name: string ): Ability | undefined {
	return abilities.find(
		( ability ) => ability.name === name || normalizeAbilityName( ability.name ) === name
	);
}
