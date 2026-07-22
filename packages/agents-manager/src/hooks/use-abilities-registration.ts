import { useEffect } from '@wordpress/element';
import { registerAmAbilities } from '../abilities';

/**
 * Registers AM-owned abilities once the chat has mounted. A provider's copy of
 * a migrated ability is replaced on collision — AM owns migrated abilities.
 * `?am_abilities=0` skips registration, leaving the provider copies in
 * charge for testing.
 */
export default function useAbilitiesRegistration(): void {
	useEffect( () => {
		if ( new URLSearchParams( window.location.search ).get( 'am_abilities' ) === '0' ) {
			return;
		}
		registerAmAbilities();
	}, [] );
}
