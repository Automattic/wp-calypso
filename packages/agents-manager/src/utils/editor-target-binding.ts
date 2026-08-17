/**
 * Binds an agent request to the editor canvas it was made for.
 *
 * The host reports the open canvas in its client context, and agenttic-client
 * asks for that context on every outgoing message — including the tool-result
 * continuations within a single request. So the last reported target is, by
 * construction, the canvas the model was looking at when it decided to call the
 * tool that is now executing. If the live canvas differs, the canvas moved in
 * the gap, and the pending write belongs to a page that is no longer on screen.
 *
 * The binding is deliberately not keyed by request id: nothing in the pipeline
 * carries one to the ability layer, and the report-then-execute ordering above
 * makes one unnecessary.
 *
 * Module-level state, matching `provider-checkpoints.ts` — there is one chat per
 * page load and the wrappers that read this are themselves module-level.
 */

/**
 * The canvas a request is bound to.
 *
 * Mirrors Big Sky's `src/ai/wp-orchestrator/editor-target.ts`. The two cannot
 * share a module across repos, so `parseEditorTarget` validates every field
 * rather than trusting the runtime shape.
 */
export type EditorTarget =
	| { available: false }
	| { available: true; key: string | null; label?: string };

export type TargetViolation =
	| { code: 'no-editor' }
	| { code: 'moved'; from: string | null; to: string | null };

/**
 * The host's canvas-change event.
 *
 * Must stay byte-identical to Big Sky's `EDITOR_TARGET_CHANGE_EVENT` in
 * `src/ai/wp-orchestrator/editor-target.ts` — with the shape parser above, this
 * is the whole cross-repo seam, so both halves of it live in this module.
 */
export const EDITOR_TARGET_CHANGE_EVENT = 'big-sky-editor-target-change';

// `null` means the host never reported a target — an older plugin, or a host
// that does not implement the contract. The guard disables itself rather than
// refusing writes it has no basis to refuse.
let reportedTarget: EditorTarget | null = null;
let liveTarget: EditorTarget | null = null;

// The violation that caused the current request to be blocked, if any. Set once
// a request has been refused or aborted for moving off its canvas, so the model
// cannot simply retry onto the page the user moved to.
//
// Storing the cause rather than a bare flag makes "blocked without a violation"
// unrepresentable, and `blockCurrentRequest()` can only ever fill it from a live
// move. That matters because the fail-open branch below sits *under* this check:
// a flag could be set on a host that never reported a target, and would then
// refuse canvas writes there is no basis to refuse. Deriving the violation from
// the live reading means only a real one can get here.
let blockedViolation: TargetViolation | null = null;

/**
 * Validate a client-context `editorTarget` value.
 *
 * @param value The raw value from the merged client context.
 * @returns The parsed target, or null when the value is not one this build understands.
 */
export function parseEditorTarget( value: unknown ): EditorTarget | null {
	if ( ! value || typeof value !== 'object' ) {
		return null;
	}

	const { available, key, label } = value as Record< string, unknown >;

	if ( available === false ) {
		return { available: false };
	}

	if ( available !== true ) {
		return null;
	}

	// A wrong-typed key degrades to "mounting", which is permissive. Coercing it
	// to a string instead would produce a key that matches nothing and would
	// therefore refuse every write.
	const parsedKey = typeof key === 'string' && key ? key : null;

	return {
		available: true,
		key: parsedKey,
		...( typeof label === 'string' && label ? { label } : {} ),
	};
}

/**
 * Record the target the host reported on an outgoing message.
 *
 * This is both the newest binding and the freshest live reading, so it sets both.
 *
 * @param value The raw `editorTarget` from the client context.
 */
export function recordReportedTarget( value: unknown ): void {
	const target = parseEditorTarget( value );
	reportedTarget = target;
	liveTarget = target;
}

/**
 * Record a live canvas reading that did not come from an outgoing message.
 *
 * @param value The raw target from the host's change event.
 */
export function recordLiveTarget( value: unknown ): void {
	liveTarget = parseEditorTarget( value );
}

/**
 * Drop the binding because the agent itself is moving the canvas.
 *
 * Called before a navigation ability runs, not after: the navigation dispatches
 * the host's change event while it executes, and a binding still in place at
 * that moment would read as a violation and abort the agent's own request.
 */
export function clearTargetBinding(): void {
	reportedTarget = null;
	liveTarget = null;
}

/**
 * Refuse canvas writes for the remainder of the current request.
 *
 * Latches whatever move is live right now rather than accepting one, so a block
 * can never outrun an actual violation — on a host that reports no target there
 * is nothing to latch, and the fail-open guarantee holds by construction.
 * Idempotent: an existing block is kept, never replaced or cleared.
 *
 * @returns Whether a block is in place.
 */
export function blockCurrentRequest(): boolean {
	if ( blockedViolation ) {
		return true;
	}

	blockedViolation = getLiveTargetMove();

	return null !== blockedViolation;
}

/**
 * Start a fresh binding for a new user message.
 */
export function startNewUserRequest(): void {
	clearTargetBinding();
	blockedViolation = null;
}

function describeTarget( target: EditorTarget | null ): string | null {
	if ( ! target?.available ) {
		return null;
	}

	return target.label ?? target.key;
}

/**
 * Whether the live canvas differs from the one the model last saw.
 *
 * The latch-free reading. Use it to decide whether something just moved; use
 * `getTargetViolation()` to decide whether a write may proceed.
 *
 * @returns The violation, or null when the live canvas still matches.
 */
export function getLiveTargetMove(): TargetViolation | null {
	// No contract from this host, or no reading yet: nothing to enforce against.
	if ( ! reportedTarget || ! liveTarget ) {
		return null;
	}

	if ( ! liveTarget.available ) {
		return { code: 'no-editor' };
	}

	// A canvas that is still mounting is not a wrong canvas. The write abilities
	// handle their own readiness and retry.
	if ( liveTarget.key === null ) {
		return null;
	}

	if ( ! reportedTarget.available ) {
		return { code: 'moved', from: null, to: describeTarget( liveTarget ) };
	}

	if ( reportedTarget.key === null || reportedTarget.key === liveTarget.key ) {
		return null;
	}

	return {
		code: 'moved',
		from: describeTarget( reportedTarget ),
		to: describeTarget( liveTarget ),
	};
}

/**
 * Whether the pending canvas write would land somewhere it was not meant to.
 *
 * @returns The violation, or null when the write may proceed.
 */
export function getTargetViolation(): TargetViolation | null {
	// Every refusal after the first names the pages from the violation that
	// caused the block, rather than re-deriving them from a binding that has
	// since rebound to the page the user moved to.
	return blockedViolation ?? getLiveTargetMove();
}
