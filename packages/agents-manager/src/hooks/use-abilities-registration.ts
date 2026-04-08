import { registerAbility, registerAbilityCategory } from '@wordpress/abilities';
import { useSelect } from '@wordpress/data';
import { useEffect, useRef } from '@wordpress/element';
import { showComponentAbility } from '../abilities/show-component';
import useCheckpoint from './use-checkpoint';
import type { ShowComponentDeps } from '../abilities/show-component/create-callback';

interface AbilitiesDeps {
	getClientIdMap: () => Record< string, string >;
	isBuildingSite: boolean;
}

// Shared across all component instances to prevent duplicate registration.
let hasRegistered = false;

/**
 * Registers agents-manager abilities via `@wordpress/abilities`.
 */
export default function useAbilitiesRegistration( {
	getClientIdMap,
	isBuildingSite,
}: AbilitiesDeps ): void {
	const checkpoint = useCheckpoint();
	const currentPostId = useSelect( ( select ) => {
		return ( select( 'core/editor' ) as { getCurrentPostId?: () => number } )?.getCurrentPostId?.();
	}, [] );

	const showComponentDeps: ShowComponentDeps = {
		currentPostId,
		getClientIdMap,
		checkpoint,
		isBuildingSite,
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
