/**
 * Enforces the editor-target binding on the merged providers.
 *
 * `editor-target-binding` owns the state machine; this module owns the policy —
 * which abilities are bound to the open canvas, which ones legitimately move it,
 * and what a refusal says. The ability lists live next to the state machine they
 * encode against rather than in the provider loader, which only composes them.
 */

import { normalizeAbilityName } from '../abilities/ability-name';
import {
	blockCurrentRequest,
	clearTargetBinding,
	getTargetViolation,
	recordReportedTarget,
	type TargetViolation,
} from './editor-target-binding';
import type { AbilityResult } from '../abilities/types';
import type { ContextProvider, ToolProvider } from '../types';

// Abilities that write to the page open in the editor. Deliberately excludes
// `big-sky/apply-update-theme` and `big-sky/set-site-logo` (site-wide — moving
// between pages does not make them wrong) and `big-sky/show-component` (not a
// write). Ownership is irrelevant here: this list is checked on the merged
// provider, so it covers abilities that have migrated to AM and abilities still
// served by an external provider alike.
//
// `edit-entity-record` is deliberately absent: it names its target explicitly
// (`entityType`/`entityName`/`recordId`, often site-level like `root`/`site` or
// `wp_navigation`), so moving the canvas cannot redirect its write. Guarding it
// would refuse legitimate site-level edits from any screen without a canvas.
//
// Normalized, because the agent invokes `big-sky/apply-block-edits` as
// `big_sky__apply_block_edits`. Matching the registered form against the name
// that actually arrives would never hit, leaving the guard inert in production.
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

function buildTargetRefusal( violation: TargetViolation ): AbilityResult {
	// Untranslated on purpose: `returnToAgent: true` means these strings are read
	// by the model, not shown to the user, unlike neighbouring abilities' messages.
	const message =
		violation.code === 'no-editor'
			? 'No page is open in the editor, so nothing was changed. Ask the user to open the page they want changed in the editor, then try again. Do not describe or design a page you cannot read.'
			: `Nothing was changed: this was requested for ${
					violation.from ?? 'a page that is no longer open'
			  }, but the editor now has ${
					violation.to ?? 'a different page'
			  } open. Do not retry it here — tell the user what happened and ask whether they want the same change on the page they are now viewing.`;

	return {
		result: {
			success: false,
			message,
			error: `editor_target_${ violation.code.replace( '-', '_' ) }`,
		},
		returnToAgent: true,
	};
}

/**
 * Records the canvas the host reports on every outgoing message.
 *
 * Wraps the merged provider rather than each external one so a host that reports
 * a target cannot be shadowed by one that does not.
 * @param contextProvider The merged context provider, if any.
 * @returns The wrapped provider, or undefined when there is nothing to wrap.
 */
export function withEditorTargetBinding(
	contextProvider: ContextProvider | undefined
): ContextProvider | undefined {
	if ( ! contextProvider ) {
		return undefined;
	}

	return {
		getClientContext: () => {
			const context = contextProvider.getClientContext();
			recordReportedTarget( ( context as Record< string, unknown > ).editorTarget );
			return context;
		},
	};
}

/**
 * Refuses a canvas write whose canvas has moved since the model asked for it.
 *
 * Applied to the merged tool provider, so it is indifferent to which provider
 * owns a given ability — including after an ability migrates into AM.
 * @param toolProvider The merged tool provider, if any.
 * @returns The wrapped provider, or undefined when there is nothing to wrap.
 */
export function withEditorTargetGuard(
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
				const violation = getTargetViolation();
				if ( violation ) {
					blockCurrentRequest();
					return buildTargetRefusal( violation );
				}
			}

			if ( CANVAS_MOVING_ABILITIES.has( normalizedName ) ) {
				clearTargetBinding();
			}

			return toolProvider.executeAbility( name, args );
		},
	};
}
