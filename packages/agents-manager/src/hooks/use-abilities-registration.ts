import { registerAbility, registerAbilityCategory } from '@wordpress/abilities';
import { useEffect } from '@wordpress/element';
import { BIG_SKY_ABILITY_CATEGORY } from '../abilities/constants';
import { showComponentAbility } from '../abilities/show-component';

// Shared across all component instances to prevent duplicate registration.
let hasRegistered = false;

/**
 * Registers AM-owned abilities via `@wordpress/abilities`.
 *
 * The registry is last-write-wins and this hook runs after external providers
 * have loaded, so AM's implementations override same-name provider copies —
 * AM is the single source of truth for each migrated ability.
 */
export default function useAbilitiesRegistration(): void {
	useEffect( () => {
		if ( hasRegistered ) {
			return;
		}
		hasRegistered = true;

		const abilities = [ showComponentAbility ];

		// Register the category before the abilities that reference it.
		( async () => {
			try {
				await registerAbilityCategory( BIG_SKY_ABILITY_CATEGORY, {
					label: 'Big Sky',
					description: 'Big Sky abilities',
				} );
			} catch {
				// Category may already be registered.
			}

			for ( const ability of abilities ) {
				try {
					await registerAbility( ability );
				} catch ( error ) {
					// eslint-disable-next-line no-console
					console.warn( `[AgentsManager] Failed to register ability: ${ ability.name }`, error );
				}
			}
		} )();
	}, [] );
}
