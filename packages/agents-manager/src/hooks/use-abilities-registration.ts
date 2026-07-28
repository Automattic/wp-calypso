import { useEffect } from '@wordpress/element';
import { registerAmAbilities } from '../abilities';

/**
 * Registers AM-owned abilities once the chat has mounted — ownership and
 * collision semantics live in `registerAmAbilities()`.
 * `?am_abilities=0` skips registration so tool calls execute through the
 * provider copies for testing (AM components still render the results).
 */
export default function useAbilitiesRegistration(): void {
	useEffect( () => {
		// TODO (ability-migration): Remove this testing switch once Big Sky deletes its
		// copies — with no provider fallback left, skipping registration would
		// only break the tools.
		if ( new URLSearchParams( window.location.search ).get( 'am_abilities' ) === '0' ) {
			return;
		}
		registerAmAbilities();
	}, [] );
}
