import { useEffect } from '@wordpress/element';
import { registerAmAbilities } from '../abilities';

/**
 * Registers AM-owned abilities once the chat has mounted — after external
 * providers have loaded, so AM's copies win in the last-write-wins registry.
 */
export default function useAbilitiesRegistration(): void {
	useEffect( () => {
		registerAmAbilities();
	}, [] );
}
