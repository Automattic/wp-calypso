import { useEffect } from '@wordpress/element';
import { registerAmAbilities } from '../abilities';

/**
 * Registers AM-owned abilities once the chat has mounted. Whether anything
 * loads or registers is decided inside `registerAmAbilities()` — the ability
 * code is editor-only and lazy, and the `?am_abilities=0` testing switch
 * hands the migrated abilities back to the provider copies.
 */
export default function useAbilitiesRegistration(): void {
	useEffect( () => {
		registerAmAbilities();
	}, [] );
}
