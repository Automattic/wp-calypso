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
import isAmAbilitiesDisabled from '../utils/is-am-abilities-disabled';
import { applyUpdateThemeAbility } from './apply-update-theme';
import { BIG_SKY_ABILITY_CATEGORY } from './constants';
import { editorNavigateAbility } from './editor-navigate';
import { getBlockTreeAbility } from './get-block-tree';
import { restoreCheckpointAbility } from './restore-checkpoint';
import { setSiteLogoAbility } from './set-site-logo';
import { showComponentAbility } from './show-component';
import { showTemplateAbility } from './show-template';
import type { Ability } from './types';

// TODO (ability-migration): Fold both lists into one with the switch (see
// `utils/is-am-abilities-disabled.ts`). Moving `show-component` to the AM-only
// list before then must drop the converter's rendering gate with it, or the
// switch would run AM's copy but render the provider's picker.

// Editor abilities a provider still ships a copy of, so the switch below has
// something to fall back to. Migrating one = add its folder under `abilities/`
// and list it here.
const MIGRATED_EDITOR_ABILITIES: Ability[] = [
	applyUpdateThemeAbility,
	editorNavigateAbility,
	restoreCheckpointAbility,
	setSiteLogoAbility,
	showComponentAbility,
];

// Editor abilities with no copy anywhere else.
const AM_ONLY_EDITOR_ABILITIES: Ability[] = [ getBlockTreeAbility, showTemplateAbility ];

const EDITOR_ABILITIES: Ability[] = [ ...MIGRATED_EDITOR_ABILITIES, ...AM_ONLY_EDITOR_ABILITIES ];

/**
 * The editor abilities AM owns. `?am_abilities=0` hands the migrated ones
 * back to the provider copies; the AM-only ones have nothing to fall back to
 * and stay on.
 */
export const getEditorAbilities = (): Ability[] =>
	isAmAbilitiesDisabled() ? AM_ONLY_EDITOR_ABILITIES : EDITOR_ABILITIES;

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

	for ( const ability of getEditorAbilities() ) {
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
