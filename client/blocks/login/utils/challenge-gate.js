// Tracked outside React because the SDK reports a challenge start synchronously
// from inside collect(), before a state update could reach a caller already
// awaiting its session id. Module state also reaches the checkout payment
// processors, which run outside React and so cannot read a hook's return value.
let pendingChallenge = null;

/**
 * Open or close the gate. Driven by the SDK's challenge callbacks.
 * @param {boolean} running Whether a challenge is on screen.
 */
export function setChallengeRunning( running ) {
	if ( ! running ) {
		pendingChallenge?.resolve();
		pendingChallenge = null;
		return;
	}

	if ( ! pendingChallenge ) {
		let resolve;
		const promise = new Promise( ( r ) => {
			resolve = r;
		} );
		pendingChallenge = { promise, resolve };
	}
}

/**
 * Resolves when no challenge is running.
 *
 * Deliberately unbounded, unlike the fail-open timeouts around the SDK itself: a
 * session carrying an unsolved challenge is rejected by verify(), so giving up
 * early would trade a wait for a guaranteed block. Every abandonment path —
 * challenge failure, presentation error, container unmount, feature disable —
 * closes the gate.
 * @returns {Promise<void>}
 */
export function waitForChallengeSettled() {
	return pendingChallenge?.promise ?? Promise.resolve();
}
