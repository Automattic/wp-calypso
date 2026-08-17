/**
 * Enforces the canvas binding on the merged providers.
 *
 * `canvas-binding` owns the state machine; this module owns the policy — which
 * abilities are bound to the open canvas, which ones legitimately move it, and what
 * a refusal says. The ability lists live next to the state machine they encode
 * against rather than in the provider loader, which only composes them.
 */

import { normalizeAbilityName } from '../abilities/ability-name';
import {
	bindToOpenCanvas,
	blockCurrentRequest,
	clearCanvasBinding,
	getBlockingMove,
	type CanvasMove,
} from './canvas-binding';
import type { AbilityResult } from '../abilities/types';
import type { ContextProvider, ToolProvider } from '../types';

// Abilities that write to the page open in the editor. Deliberately excludes
// `big-sky/apply-update-theme` and `big-sky/set-site-logo` (site-wide — moving
// between pages does not make them wrong) and `big-sky/show-component` (not a
// write). Ownership is irrelevant here: this list is checked on the merged
// provider, so it covers abilities that have migrated into AM and abilities still
// served by an external provider alike.
//
// `edit-entity-record` is deliberately absent: it names its target explicitly
// (`entityType`/`entityName`/`recordId`, often site-level like `root`/`site` or
// `wp_navigation`), so moving the canvas cannot redirect its write. Guarding it
// would refuse legitimate site-level edits from any screen.
//
// Normalized, because the agent invokes `big-sky/apply-block-edits` as
// `big_sky__apply_block_edits`. Matching the registered form against the name that
// actually arrives would never hit, leaving the guard inert in production.
const CANVAS_BOUND_ABILITIES = new Set(
	[ 'big-sky/apply-block-edits', 'big-sky/stream-page-design', 'big-sky/restore-checkpoint' ].map(
		normalizeAbilityName
	)
);

// Abilities whose whole job is to move the canvas. The binding is dropped before
// they run, so the move they cause does not read as a violation.
const CANVAS_MOVING_ABILITIES = new Set(
	[ 'big-sky/editor-navigate', 'wp-admin/navigate' ].map( normalizeAbilityName )
);

function buildCanvasRefusal( move: CanvasMove ): AbilityResult {
	return {
		result: {
			success: false,
			// Untranslated on purpose: `returnToAgent: true` means this string is read
			// by the model, not shown to the user, unlike neighbouring abilities'
			// messages.
			message: `Nothing was changed: this was requested for ${
				move.from ?? 'a page that is no longer open'
			}, but the editor now has ${
				move.to ?? 'a different page'
			} open. Do not retry it here — tell the user what happened and ask whether they want the same change on the page they are now viewing.`,
			error: 'editor_canvas_moved',
		},
		returnToAgent: true,
	};
}

/**
 * Binds to the open canvas on every outgoing message.
 *
 * Wraps the merged provider rather than each external one, so the binding happens
 * once per message however many providers are registered. The context itself is
 * passed through untouched — the canvas is read from the editor store here, not
 * carried on the wire.
 * @param contextProvider The merged context provider, if any.
 * @returns The wrapped provider, or undefined when there is nothing to wrap.
 */
export function withCanvasBinding(
	contextProvider: ContextProvider | undefined
): ContextProvider | undefined {
	if ( ! contextProvider ) {
		return undefined;
	}

	return {
		getClientContext: () => {
			bindToOpenCanvas();
			return contextProvider.getClientContext();
		},
	};
}

/**
 * Refuses a canvas write whose canvas has moved since the model asked for it.
 *
 * Applied to the merged tool provider, so it is indifferent to which provider owns
 * a given ability — including after an ability migrates into AM.
 * @param toolProvider The merged tool provider, if any.
 * @returns The wrapped provider, or undefined when there is nothing to wrap.
 */
export function withCanvasGuard(
	toolProvider: ToolProvider | undefined
): ToolProvider | undefined {
	if ( ! toolProvider ) {
		return undefined;
	}

	return {
		getAbilities: () => toolProvider.getAbilities(),
		executeAbility: async ( name: string, args: unknown ) => {
			// Normalize the incoming name too: it may arrive in either form
			// (`findAbilityByName` accepts both), and normalizing an already
			// normalized name is a no-op.
			const normalizedName = normalizeAbilityName( name );

			if ( CANVAS_BOUND_ABILITIES.has( normalizedName ) ) {
				const move = getBlockingMove();
				if ( move ) {
					blockCurrentRequest();
					return buildCanvasRefusal( move );
				}
			}

			if ( CANVAS_MOVING_ABILITIES.has( normalizedName ) ) {
				clearCanvasBinding();
			}

			return toolProvider.executeAbility( name, args );
		},
	};
}
