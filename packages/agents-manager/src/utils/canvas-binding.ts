/**
 * Binds an agent request to the editor canvas it was made for.
 *
 * agenttic-client asks the context provider for client context on every outgoing
 * message — including the tool-result continuations within a single request — so
 * binding there means the bound canvas is, by construction, the one the model was
 * looking at when it chose the tool that is now executing. If the live canvas
 * differs, it moved in the gap and the pending write belongs to a page that is no
 * longer on screen.
 *
 * The binding is deliberately not keyed by request id: nothing in the pipeline
 * carries one to the ability layer, and the bind-then-execute ordering above makes
 * one unnecessary.
 *
 * A canvas is a plain `postType:postId` string. Losing it counts as a move: once a
 * request is bound, the editor reporting no canvas means the user left the page the
 * request was for, not that the canvas is still coming up. Nothing can be bound
 * before the editor has mounted — the binding is taken when the message goes out —
 * and the one flow that legitimately runs against a mounting canvas, the agent
 * navigating itself, drops the binding first via `clearCanvasBinding()`.
 *
 * That distinction matters because the write abilities *poll*: page-design's
 * `resolvePageDesignTargetRoot` returns null until a post resolves and the renderer
 * retries. Letting an absent canvas through turns that readiness retry into an
 * unbounded loop against a page that is never coming back.
 *
 * Module-level state, matching `provider-checkpoints.ts` — there is one chat per
 * page load and the wrappers that read this are themselves module-level.
 */

import { select } from '@wordpress/data';

/** A canvas the model was looking at, as key plus the label a refusal names it by. */
type BoundCanvas = { key: string; label: string | null };

/**
 * A canvas change, described in the terms a refusal message uses.
 *
 * `to: null` means the editor now has no canvas at all — the user left it — which
 * needs different advice to the model than landing on a different page.
 */
export type CanvasMove = { from: string; to: string | null };

type EditorSelectStore =
	| {
			getCurrentPostId?: () => number | string | undefined;
			getCurrentPostType?: () => string | undefined;
			getEditedPostAttribute?: ( attribute: string ) => unknown;
	  }
	| undefined;

// `null` means nothing is bound — before the first message, or after an ability
// deliberately moved the canvas. Nothing to enforce against either way.
let bound: BoundCanvas | null = null;

// The move that caused the current request to be blocked, if any. Set once a
// request has been refused or aborted for leaving its canvas, so the model cannot
// simply retry onto the page the user moved to.
//
// Storing the move rather than a bare flag makes "blocked without a move"
// unrepresentable, and `blockCurrentRequest()` can only ever fill it from a live
// reading — so a block can never name pages that did not actually move.
let blockedMove: CanvasMove | null = null;

function getEditorStore(): EditorSelectStore {
	try {
		return select( 'core/editor' ) as EditorSelectStore;
	} catch {
		// An unregistered store is not evidence of anything; stay permissive.
		return undefined;
	}
}

/**
 * Compose a canvas key.
 *
 * Exported so a component's `useSelect` and this module cannot drift on the format
 * — a mismatch would read as a permanent move and refuse every canvas write.
 *
 * Carries the post type as well as the id because ids are only unique within one:
 * a page and a template can share an id, and treating them as the same canvas
 * would let a write aimed at one land on the other.
 *
 * @param postType The editor's current post type.
 * @param postId   The editor's current post id.
 * @returns The key, or null when either half is missing.
 */
export function buildCanvasKey(
	postType: string | undefined,
	postId: number | string | undefined
): string | null {
	if ( ! postType || ! postId ) {
		return null;
	}

	return `${ postType }:${ postId }`;
}

/**
 * The canvas open right now.
 *
 * @returns The key, or null when the editor store cannot name one.
 */
export function resolveCanvasKey(): string | null {
	const editor = getEditorStore();

	return buildCanvasKey( editor?.getCurrentPostType?.(), editor?.getCurrentPostId?.() );
}

function readOpenCanvas(): BoundCanvas | null {
	const key = resolveCanvasKey();

	if ( null === key ) {
		return null;
	}

	const title = getEditorStore()?.getEditedPostAttribute?.( 'title' );

	return {
		key,
		label: typeof title === 'string' && title.trim() ? title.trim() : null,
	};
}

/**
 * Bind to whatever canvas is open now. Called on every outgoing message.
 */
export function bindToOpenCanvas(): void {
	bound = readOpenCanvas();
}

/**
 * Drop the binding because the agent itself is moving the canvas.
 *
 * Called before a navigation ability runs, not after: the navigation changes the
 * canvas while it executes, and a binding still in place at that moment would read
 * as a move and abort the agent's own request.
 */
export function clearCanvasBinding(): void {
	bound = null;
}

/**
 * Reset to the unbound, unblocked state for a new user message or a regenerate.
 *
 * Both halves matter, for different reasons.
 *
 * Dropping the binding is the load-bearing one, and it is not about the block at
 * all. A new turn flips `isProcessing` before its own outbound message rebinds, so
 * between those two moments the binding still names the *previous* turn's canvas.
 * If the user navigated since that turn — the ordinary case of finishing on one
 * page and asking about another — the abort effect reads the stale binding as a
 * move and kills the request the user just made. Clearing here removes the window
 * rather than racing it.
 *
 * Clearing the block is what keeps a refusal from outliving the request it was
 * meant for. Nothing else ever clears `blockedMove`, so without this one canvas
 * move would refuse every canvas write for the rest of the page load.
 */
export function startNewUserRequest(): void {
	clearCanvasBinding();
	blockedMove = null;
}

/**
 * Whether the live canvas differs from the one the model last saw.
 *
 * The latch-free reading. Use it to decide whether something just moved; use
 * `getBlockingMove()` to decide whether a write may proceed.
 *
 * @returns The move, or null when the live canvas still matches.
 */
export function getCanvasMove(): CanvasMove | null {
	if ( ! bound ) {
		return null;
	}

	const live = readOpenCanvas();

	if ( live?.key === bound.key ) {
		return null;
	}

	return {
		from: bound.label ?? bound.key,
		// No live canvas is a move to nowhere, not a reason to wait: see the note
		// at the top of this module on why a bound request can never be looking at
		// a canvas that is merely still mounting.
		to: live ? live.label ?? live.key : null,
	};
}

/**
 * Refuse canvas writes for the remainder of the current request.
 *
 * Latches whatever move is live right now rather than accepting one, so a block can
 * never outrun an actual move. Idempotent: an existing block is kept, never
 * replaced, so every later refusal still names the pages the request was blocked
 * for rather than a binding that has since moved on.
 *
 * @returns Whether a block is in place.
 */
export function blockCurrentRequest(): boolean {
	if ( blockedMove ) {
		return true;
	}

	blockedMove = getCanvasMove();

	return null !== blockedMove;
}

/**
 * Whether a pending canvas write would land somewhere it was not meant to.
 *
 * @returns The move, or null when the write may proceed.
 */
export function getBlockingMove(): CanvasMove | null {
	return blockedMove ?? getCanvasMove();
}
