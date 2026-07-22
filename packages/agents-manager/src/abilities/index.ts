import { registerAbility, registerAbilityCategory, unregisterAbility } from '@wordpress/abilities';
import { BIG_SKY_ABILITY_CATEGORY } from './constants';
import { showComponentAbility } from './show-component';
import type { Ability } from './types';

// AM-owned abilities. Migrating an ability from Big Sky = add its folder
// under `abilities/` and list it here.
const AM_ABILITIES: Ability[] = [ showComponentAbility ];

// Registration is one-time per page load.
let hasRegistered = false;

/**
 * Registers AM-owned abilities via `@wordpress/abilities`.
 *
 * The registry rejects duplicate names, and providers may register their own
 * copies of migrated abilities first — so a collision is resolved by replacing
 * the provider's copy, making AM the owner of each migrated ability. Providers
 * delete their copies as cleanup once a migration lands.
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
		} catch {
			try {
				await unregisterAbility( ability.name );
				await registerAbility( ability );
			} catch ( error ) {
				// eslint-disable-next-line no-console
				console.warn( `[AgentsManager] Failed to register ability: ${ ability.name }`, error );
			}
		}
	}
}
