/**
 * Client run-id state for the Review Mediation flow. Generated at click time and
 * consumed by the mediation card on mount so all events share a join key.
 */

const PENDING_RUN_ID_TTL_MS = 5 * 60 * 1000;

let pendingRunId: string | null = null;
let pendingRunIdSetAt = 0;

export function generateClientRunId(): string {
	if ( typeof globalThis.crypto?.randomUUID === 'function' ) {
		return globalThis.crypto.randomUUID();
	}
	return `rm-${ Date.now().toString( 36 ) }-${ Math.random().toString( 36 ).slice( 2, 10 ) }`;
}

export function setPendingClientRunId( clientRunId: string ): void {
	pendingRunId = clientRunId;
	pendingRunIdSetAt = Date.now();
}

/**
 * Reads and drains the pending client run id. Drain prevents a stale id from
 * leaking into a later programmatic card; TTL drops ids from clicks that
 * never produced a card (orchestrator failure, navigation away, etc.).
 */
export function consumePendingClientRunId(): string | null {
	if ( pendingRunId !== null && Date.now() - pendingRunIdSetAt > PENDING_RUN_ID_TTL_MS ) {
		pendingRunId = null;
	}
	const id = pendingRunId;
	pendingRunId = null;
	pendingRunIdSetAt = 0;
	return id;
}
