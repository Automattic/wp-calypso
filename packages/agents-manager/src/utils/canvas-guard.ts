/**
 * Enforces the canvas binding on the merged providers.
 *
 * `canvas-binding` owns the state machine; this module owns the policy: which
 * abilities are bound to the open canvas, which ones legitimately move it, and
 * what a refusal says. The lists live here, next to the state machine they
 * encode against, rather than in the provider loader that composes them.
 *
 * The policy is installed on both dispatch paths. agenttic-client calls an
 * ability's own `callback` when it has one and falls back to `executeAbility`
 * only when it does not, and every Big Sky ability has a callback — so guarding
 * `executeAbility` alone would leave the guard inert.
 */

import { normalizeAbilityName } from '../abilities/ability-name';
import { PAGE_PATH } from '../abilities/editor-navigate/page-path';
import {
	bindToNavigationTarget,
	bindToOpenCanvas,
	blockCurrentRequest,
	buildCanvasKey,
	clearCanvasBinding,
	getBlockingMove,
	type CanvasMove,
} from './canvas-binding';
import type { Ability, AbilityResult } from '../abilities/types';
import type { ContextProvider, ToolProvider } from '../types';

// Abilities that write to the page open in the editor. `apply-update-theme` and
// `set-site-logo` are site-wide and `show-component` is not a write, so moving
// between pages cannot make them wrong. `edit-entity-record` names its own
// target (`entityType`/`entityName`/`recordId`, often site-level like
// `root`/`site`), so guarding it would refuse legitimate site-level edits; it
// moves the canvas itself through `bindToEditorPath()` before deleting the open
// page.
//
// Checked on the merged provider, so it covers AM's abilities and external ones
// alike. Normalized, because the agent invokes `big-sky/apply-block-edits` as
// `big_sky__apply_block_edits` — matching the registered form would never hit.
const CANVAS_BOUND_ABILITIES = new Set(
	[ 'big-sky/apply-block-edits', 'big-sky/stream-page-design', 'big-sky/restore-checkpoint' ].map(
		normalizeAbilityName
	)
);

// Abilities whose whole job is to move the canvas, so the move they cause must not
// read as a violation. Where the destination is knowable the binding follows them
// to it; otherwise it is dropped. See `resolveNavigationTarget`.
const CANVAS_MOVING_ABILITIES = new Set(
	[ 'big-sky/editor-navigate', 'wp-admin/navigate' ].map( normalizeAbilityName )
);

// Every ability the policy acts on, and so the only ones whose callbacks are worth
// wrapping.
const POLICED_ABILITIES = new Set( [ ...CANVAS_BOUND_ABILITIES, ...CANVAS_MOVING_ABILITIES ] );

const EDITOR_NAVIGATE_ABILITY = normalizeAbilityName( 'big-sky/editor-navigate' );

/**
 * Hands the binding to an editor navigation about to run.
 *
 * Only a page path names a destination the binding can follow; `all-pages` drops
 * it instead. Exported for `edit-entity-record`, which leaves the page it is about
 * to delete by calling the navigate callback directly, outside the dispatch this
 * policy wraps — without the handoff, its own move reads as the user leaving and
 * aborts the request.
 * @param path The editor path being navigated to.
 * @returns A rollback for a navigation that never happens; see `canvas-binding`.
 */
export function bindToEditorPath( path: string ): () => void {
	const target = buildCanvasKey( 'page', PAGE_PATH.exec( path )?.[ 1 ] );

	return target ? bindToNavigationTarget( target ) : clearCanvasBinding();
}

function buildCanvasRefusal( move: CanvasMove ): AbilityResult {
	// Untranslated on purpose: `returnToAgent: true` means the model reads these
	// strings, not the user. Both spell out "do not retry", the no-canvas one
	// hardest: the write abilities poll for a canvas to appear, so a model that
	// finds another route into the same write keeps a doomed request alive.
	const message =
		null === move.to
			? `Nothing was changed: this was requested for ${ move.from }, but the editor is no longer open on it and there is no page on screen to change. Do not retry this or try another way to make the same change — nothing can be edited until a page is open. Tell the user the request stopped because they navigated away, and ask them to reopen the page if they still want it.`
			: `Nothing was changed: this was requested for ${ move.from }, but the editor now has ${ move.to } open. Do not retry it here — tell the user what happened and ask whether they want the same change on the page they are now viewing.`;

	return {
		result: {
			success: false,
			message,
			error: null === move.to ? 'editor_canvas_closed' : 'editor_canvas_moved',
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
 * What the policy decided about one about-to-run ability.
 *
 * `rollbackBinding` is set only for an ability that moves the canvas: it has been
 * handed the binding for a move that has not happened yet, and this puts it back
 * if the move turns out not to happen at all.
 */
type CanvasPolicy = {
	refusal: AbilityResult | null;
	rollbackBinding: ( () => void ) | null;
};

/**
 * Applies the canvas policy to one about-to-run ability.
 *
 * Shared by both dispatch paths, which is the whole point: agenttic-client calls an
 * ability's own `callback` when it has one and only falls back to the provider's
 * `executeAbility` when it does not, so a policy installed on one path alone is
 * inert for every ability that takes the other.
 * @param name The ability name, in either form.
 * @param args The ability arguments.
 * @returns The refusal to return instead of running it, and how to undo the binding it took.
 */
function applyCanvasPolicy( name: string, args: unknown ): CanvasPolicy {
	// Normalize the incoming name too: it may arrive in either form
	// (`findAbilityByName` accepts both), and normalizing an already
	// normalized name is a no-op.
	const normalizedName = normalizeAbilityName( name );

	if ( CANVAS_BOUND_ABILITIES.has( normalizedName ) ) {
		const move = getBlockingMove();
		if ( move ) {
			blockCurrentRequest();
			return { refusal: buildCanvasRefusal( move ), rollbackBinding: null };
		}
	}

	if ( CANVAS_MOVING_ABILITIES.has( normalizedName ) ) {
		// Only `editor-navigate` names a destination. `wp-admin/navigate` leaves the
		// editor entirely, so the binding is dropped rather than guessed.
		const path =
			normalizedName === EDITOR_NAVIGATE_ABILITY
				? ( args as { path?: unknown } | undefined )?.path
				: undefined;

		return {
			refusal: null,
			rollbackBinding: typeof path === 'string' ? bindToEditorPath( path ) : clearCanvasBinding(),
		};
	}

	return { refusal: null, rollbackBinding: null };
}

/**
 * Whether an ability answered that it did not do what it was asked.
 *
 * Abilities answer with the `AbilityResult` envelope, but the provider contract
 * types both dispatch paths as `Promise< any >`, so this reads defensively and
 * accepts the bare form too. Anything it cannot recognize counts as success: a
 * navigation whose result shape drifts should leave the binding where a working
 * navigation leaves it, not somewhere new.
 * @param result Whatever the ability answered.
 * @returns Whether it reported failure.
 */
interface FailureAnswer {
	success?: unknown;
	details?: { navigated?: unknown };
}

/**
 * A failure that never moved. One carrying `navigated` changed the route
 * before failing — `editor-navigate`'s load timeout — so its destination is
 * still where the editor is heading.
 */
function failedWithoutMoving( result: unknown ): boolean {
	const answer = result as ( FailureAnswer & { result?: FailureAnswer } ) | undefined;
	const failure = answer?.result ?? answer;

	return false === failure?.success && ! failure?.details?.navigated;
}

/**
 * Dispatches one ability under the policy, undoing a move that never happened.
 *
 * The abilities that take the binding forward can fail without navigating —
 * `editor-navigate` answers `{ success: false }` on a save conflict, a stale page
 * id or a network error, and can throw outright. Without this, the destination it
 * was handed stays bound to a page the editor is never going to open, and every
 * later canvas write in the turn goes through unguarded.
 * @param name     The ability name, in either form.
 * @param args     The ability arguments.
 * @param dispatch Runs the ability itself.
 * @returns The refusal, or whatever the ability answered.
 */
async function dispatchUnderCanvasPolicy(
	name: string,
	args: unknown,
	dispatch: () => Promise< unknown >
): Promise< unknown > {
	const { refusal, rollbackBinding } = applyCanvasPolicy( name, args );

	if ( refusal ) {
		return refusal;
	}

	if ( ! rollbackBinding ) {
		return dispatch();
	}

	try {
		const result = await dispatch();

		if ( failedWithoutMoving( result ) ) {
			rollbackBinding();
		}

		return result;
	} catch ( error ) {
		// Restored, not swallowed: the caller still sees the failure.
		rollbackBinding();
		throw error;
	}
}

/**
 * Puts the policy on an ability's own callback.
 *
 * The refusal shape needs no translation: `AbilityResult` is what the abilities
 * being guarded already return from their callbacks, and agenttic-client reads
 * `returnToAgent` off that same object either way.
 * @param ability The ability as its provider registered it.
 * @returns The ability, with a guarded callback when it has one to guard.
 */
function guardAbilityCallback( ability: Ability ): Ability {
	const { callback } = ability;

	// Everything the policy has no opinion on is handed back as-is, identity and
	// all: a wrapper there would buy nothing and put this module in the path of
	// every ability on the site.
	if ( ! callback || ! POLICED_ABILITIES.has( normalizeAbilityName( ability.name ) ) ) {
		return ability;
	}

	return {
		...ability,
		// The callback path carries the arguments inline, alongside the ids
		// agenttic-client adds — so `path` is read from the same object.
		callback: ( input ) =>
			dispatchUnderCanvasPolicy( ability.name, input, async () => callback( input ) ),
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
		getAbilities: async () => ( await toolProvider.getAbilities() ).map( guardAbilityCallback ),
		executeAbility: ( name: string, args: unknown ) =>
			dispatchUnderCanvasPolicy( name, args, async () =>
				toolProvider.executeAbility( name, args )
			),
	};
}
