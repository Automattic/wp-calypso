import { useEffect } from '@wordpress/element';
import { registerAmAbilities } from '../abilities';
import isAmAbilitiesDisabled from '../utils/is-am-abilities-disabled';

/**
 * Registers AM-owned abilities once the chat has mounted — ownership and
 * collision semantics live in `registerAmAbilities()`, and the
 * `?am_abilities=0` testing switch in `isAmAbilitiesDisabled()`.
 */
export default function useAbilitiesRegistration(): void {
	useEffect( () => {
		if ( isAmAbilitiesDisabled() ) {
			return;
		}
		registerAmAbilities();
	}, [] );
}
