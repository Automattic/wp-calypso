import { useEffect } from '@wordpress/element';
import { registerAmAbilities } from '../abilities';

/**
 * Registers AM-owned abilities once the chat has mounted. A provider's copy of
 * a migrated ability is replaced on collision — AM owns migrated abilities.
 */
export default function useAbilitiesRegistration(): void {
	useEffect( () => {
		registerAmAbilities();
	}, [] );
}
