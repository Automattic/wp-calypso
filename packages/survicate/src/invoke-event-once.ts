import debug from './debug';
import { invokeSurvicateEvent } from './invoke-event';

const STORAGE_PREFIX = 'survicate-event-once';

/**
 * Invokes a Survicate event at most once per `key` in this browser, for screens that keep reporting the same
 * outcome on every visit (a migration that completed days ago, say) but should only ask for the survey once.
 *
 * The key is marked only once the SDK has been handed the event, so an event that was suppressed (support session,
 * Help Center or another modal open), or that was still waiting for the SDK when the screen was left, is asked for
 * again on the next visit. Without storage the event can repeat, which the survey's own frequency settings absorb.
 * @returns A cleanup function that removes the deferred event listener, as `invokeSurvicateEvent` does.
 */
export function invokeSurvicateEventOnce( eventName: string, key: string ): () => void {
	const storageKey = `${ STORAGE_PREFIX }:${ eventName }:${ key }`;
	try {
		if ( window.localStorage.getItem( storageKey ) ) {
			debug( 'Survicate event "%s" already invoked for %s', eventName, key );
			return () => {};
		}
	} catch {
		// Storage disabled.
	}
	return invokeSurvicateEvent( eventName, () => {
		try {
			window.localStorage.setItem( storageKey, String( Date.now() ) );
		} catch {
			// Storage disabled or full.
		}
	} );
}
