import { registerAbility, registerAbilityCategory } from '@wordpress/abilities';
import { useSelect } from '@wordpress/data';
import { useEffect, useRef } from '@wordpress/element';
import { showComponentAbility } from '../abilities/show-component';
import useCheckpoint from './use-checkpoint';
import type { ShowComponentDeps } from '../abilities/show-component/create-callback';

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
	const checkpoint = useCheckpoint();
	const currentPostId = useSelect( ( select ) => {
		return ( select( 'core/editor' ) as { getCurrentPostId?: () => number } )?.getCurrentPostId?.();
	}, [] );

	const showComponentDeps: ShowComponentDeps = {
		currentPostId,
		checkpoint,
	};

	// Updated every render so the one-time `useEffect` reads fresh values.
	const depsRef = useRef( { showComponent: showComponentDeps } );
	depsRef.current = { showComponent: showComponentDeps };

	useEffect( () => {
		if ( hasRegistered ) {
			return;
		}
		hasRegistered = true;

		// Abilities to register.
		const abilities = [ showComponentAbility( () => depsRef.current.showComponent ) ];

		// Register category before abilities (required ordering).
		// Uses `big-sky` to match the backend route configuration.
		( async () => {
			try {
				await registerAbilityCategory( 'big-sky', {
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
