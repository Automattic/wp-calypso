/**
 * Lazy facade over the ability implementations.
 *
 * The editor abilities carry the editor stack (checkpoint engine, style
 * application), so they load as an async chunk and only on editor pages.
 * Chats everywhere else (Reader, wp-admin list screens, Calypso) never fetch
 * the chunk, keeping their bundles small. The `?am_abilities=0` testing
 * switch skips the load too, flipping the editor abilities back to the
 * provider copies — the all-surface abilities have no fallback and stay on.
 */

import isAmAbilitiesDisabled from '../utils/is-am-abilities-disabled';
import { isEditorPage } from '../utils/is-editor-page';
import { executeAbilityFromList } from './execute-ability';
import { wpAdminNavigateAbility } from './wp-admin-navigate';
import type { ToolProvider } from '../extension-types';
import type { Ability } from './types';
import type { CheckpointContextItem } from '../utils/checkpoints';

type EditorAbilitiesModule = typeof import('./editor-abilities');

let editorAbilitiesPromise: Promise< EditorAbilitiesModule > | null = null;
let loadedEditorAbilities: EditorAbilitiesModule | null = null;

// TODO (ability-migration): Drop the `?am_abilities=0` checks in this file —
// the load gate below, the owned-ability list, and the checkpoint context —
// with the switch itself. See `utils/is-am-abilities-disabled.ts`.
function loadEditorAbilities(): Promise< EditorAbilitiesModule > | null {
	if ( ! editorAbilitiesPromise && isEditorPage() && ! isAmAbilitiesDisabled() ) {
		editorAbilitiesPromise = import(
			/* webpackChunkName: "am-editor-abilities" */ './editor-abilities'
		).then(
			( module ) => {
				loadedEditorAbilities = module;

				// Register on the first successful load, whichever call
				// triggered it — the mount effect may have failed transiently.
				module.registerEditorAbilities().catch( ( error ) => {
					// eslint-disable-next-line no-console
					console.error( '[AgentsManager] Failed to register the editor abilities:', error );
				} );

				return module;
			},
			( error ) => {
				// A transient chunk failure must not disable the abilities for
				// the rest of the session — the next call retries.
				editorAbilitiesPromise = null;

				// eslint-disable-next-line no-console
				console.error( '[AgentsManager] Failed to load the editor abilities:', error );
				throw error;
			}
		);
	}
	return editorAbilitiesPromise;
}

// All-surface abilities stay in the main bundle and run on every surface —
// only the editor stack earns the lazy chunk.
const ALL_SURFACE_ABILITIES: Ability[] = [ wpAdminNavigateAbility ];

// A failed chunk load (already logged and set up to retry above) degrades to
// the all-surface list — editor tool calls then fall through to the provider
// copies.
async function getOwnedAbilities(): Promise< Ability[] > {
	// All-surface abilities are fully migrated — no provider fallback, so the
	// `?am_abilities=0` switch flips only the editor abilities.
	if ( isAmAbilitiesDisabled() ) {
		return [ ...ALL_SURFACE_ABILITIES ];
	}

	let editorAbilities: Ability[] = [];
	try {
		const module = loadEditorAbilities();
		editorAbilities = module ? ( await module ).getEditorAbilities() : [];
	} catch {
		// Fall through with the chunk-less list.
	}

	return [ ...ALL_SURFACE_ABILITIES, ...editorAbilities ];
}

/**
 * Serves AM-owned abilities to the agent's tool pipeline. Tool calls resolve
 * through the provider chain first-write-wins by ability name, and this
 * provider is placed before the external ones — so each migrated ability
 * executes through AM even if a provider still ships its copy.
 *
 * Off the editor only the all-surface abilities are owned; everything else
 * falls through to the provider copies and the editor chunk stays unloaded.
 */
export const amToolProvider: ToolProvider = {
	getAbilities: getOwnedAbilities,
	executeAbility: async ( name: string, args: unknown ) =>
		executeAbilityFromList( await getOwnedAbilities(), name, args ),
};

/**
 * Loads the editor abilities when the surface qualifies — registration
 * happens with the load. A no-op everywhere else; all-surface abilities need
 * no registration, since execution ownership comes from the provider chain,
 * not the registry.
 */
export async function registerAmAbilities(): Promise< void > {
	try {
		await loadEditorAbilities();
	} catch {
		// Already logged; the next facade call retries the load.
	}
}

/**
 * AM's checkpoints for the merged `availableCheckpoints` context — a sync
 * view because the `ContextProvider` contract is sync. Empty until the
 * editor abilities finish loading: with no ability executions there are no
 * checkpoints, so reading is never a reason to load them. Empty again under
 * `?am_abilities=0`, so the agent is never offered ids that AM no longer
 * restores.
 */
export function getAmCheckpointContext(): CheckpointContextItem[] {
	if ( isAmAbilitiesDisabled() || ! loadedEditorAbilities ) {
		return [];
	}

	return loadedEditorAbilities.getAvailableCheckpoints();
}
