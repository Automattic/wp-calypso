import {
	getAbility,
	registerAbility,
	registerAbilityCategory,
	unregisterAbility,
} from '@wordpress/abilities';
import isAmAbilitiesDisabled from '../utils/is-am-abilities-disabled';
import { BIG_SKY_ABILITY_CATEGORY } from './constants';
import { showComponentAbility } from './show-component';
import type { ToolProvider } from '../extension-types';
import type { Ability } from './types';

// AM-owned abilities. Migrating an ability from Big Sky = add its folder
// under `abilities/` and list it here.
const AM_ABILITIES: Ability[] = [ showComponentAbility ];

// The agent routes tool calls with `/` → `__` and `-` → `_`.
export const normalizeAbilityName = ( name: string ) =>
	name.replace( /\//g, '__' ).replace( /-/g, '_' );

// The `?am_abilities=0` switch empties this, flipping execution back to the
// provider copies for testing.
const getOwnedAbilities = () => ( isAmAbilitiesDisabled() ? [] : AM_ABILITIES );

/**
 * Serves AM-owned abilities to the agent's tool pipeline. Tool calls resolve
 * through the provider chain first-write-wins by ability name, and this
 * provider is placed before the external ones — so each migrated ability
 * executes through AM even while providers still ship their copies.
 */
export const amToolProvider: ToolProvider = {
	getAbilities: async () => getOwnedAbilities(),
	executeAbility: async ( name: string, args: unknown ) => {
		const ability = getOwnedAbilities().find(
			( candidate ) => candidate.name === name || normalizeAbilityName( candidate.name ) === name
		);
		if ( ! ability?.callback ) {
			throw new Error( `Agents Manager does not own the ability: ${ name }` );
		}
		return ( ability.callback as ( input: unknown ) => Promise< unknown > )( args );
	},
};

// Registration is one-time per page load.
let hasRegistered = false;

/**
 * Registers AM-owned abilities in the `@wordpress/abilities` registry.
 *
 * Registration keeps the abilities discoverable in the registry — execution
 * ownership lives in `amToolProvider` above. The registry rejects duplicate
 * names, and providers may register their own copies first; a collision is
 * resolved by replacing the provider's copy. Providers delete their copies as
 * cleanup once a migration lands.
 */
export async function registerAmAbilities(): Promise< void > {
	if ( hasRegistered ) {
		return;
	}
	hasRegistered = true;

	// Register the category before the abilities that reference it.
	try {
		await registerAbilityCategory( BIG_SKY_ABILITY_CATEGORY, {
			label: 'Big Sky',
			description: 'Big Sky abilities',
		} );
	} catch {
		// Category may already be registered.
	}

	for ( const ability of AM_ABILITIES ) {
		try {
			await registerAbility( ability );
		} catch ( error ) {
			// TODO (ability-migration): Collapse this replace branch once Big Sky deletes its
			// ability copies — with nothing left to collide, plain register
			// plus the warning suffices.
			// Only retry when another copy actually holds the name — without
			// one, the failure is not a collision and re-registering would
			// fail the same way.
			if ( ! getAbility( ability.name ) ) {
				// eslint-disable-next-line no-console
				console.warn( `[AgentsManager] Failed to register ability: ${ ability.name }`, error );
				continue;
			}
			try {
				await unregisterAbility( ability.name );
				await registerAbility( ability );
			} catch ( replaceError ) {
				// eslint-disable-next-line no-console
				console.warn(
					`[AgentsManager] Failed to register ability: ${ ability.name }`,
					replaceError
				);
			}
		}
	}
}
