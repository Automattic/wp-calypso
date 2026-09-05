/**
 * The editor ability implementations. This module carries the editor stack
 * (checkpoint engine, style application), so it must only be reached through
 * the lazy facade in `./index.ts` — never import it statically from shared
 * chat code.
 */

import {
	getAbility,
	registerAbility,
	registerAbilityCategory,
	unregisterAbility,
} from '@wordpress/abilities';
import { BIG_SKY_ABILITY_CATEGORY } from './constants';
import { editorNavigateAbility } from './editor-navigate';
import { getBlockTreeAbility } from './get-block-tree';
import { restoreCheckpointAbility } from './restore-checkpoint';
import { setSiteLogoAbility } from './set-site-logo';
import { showComponentAbility } from './show-component';
import { showTemplateAbility } from './show-template';
import type { Ability } from './types';

// Editor abilities. Migrating an editor ability from Big Sky = add its folder
// under `abilities/` and list it here.
const EDITOR_ABILITIES: Ability[] = [
	editorNavigateAbility,
	getBlockTreeAbility,
	restoreCheckpointAbility,
	setSiteLogoAbility,
	showComponentAbility,
	showTemplateAbility,
];

export const getEditorAbilities = () => EDITOR_ABILITIES;

// Registration is one-time per page load.
let hasRegistered = false;

/**
 * Registers the editor abilities in the `@wordpress/abilities` registry.
 *
 * Registration keeps the abilities discoverable in the registry — execution
 * ownership lives in `amToolProvider`. The registry rejects duplicate
 * names, and providers may register their own copies first; a collision is
 * resolved by replacing the provider's copy. Providers delete their copies as
 * cleanup once a migration lands.
 */
export async function registerEditorAbilities(): Promise< void > {
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

	for ( const ability of EDITOR_ABILITIES ) {
		try {
			await registerAbility( ability );
		} catch ( error ) {
			// TODO (ability-migration): Collapse this replace branch once Big Sky
			// deletes its ability copies — with nothing left to collide, plain
			// register plus the warning suffices.

			// Only retry when another copy actually holds the name — without
			// one, the failure is not a collision and re-registering would
			// fail the same way.
			if ( ! getAbility( ability.name ) ) {
				// eslint-disable-next-line no-console
				console.warn( `[AgentsManager] Failed to register ability: ${ ability.name }`, error );
				continue;
			}

			try {
				await unregisterAbility( ability.name );
				await registerAbility( ability );
			} catch ( replaceError ) {
				// eslint-disable-next-line no-console
				console.warn(
					`[AgentsManager] Failed to register ability: ${ ability.name }`,
					replaceError
				);
			}
		}
	}
}

// Re-exported for the facade's sync checkpoint view (`getAmCheckpointContext`).
export { getAvailableCheckpoints } from '../utils/checkpoints';
