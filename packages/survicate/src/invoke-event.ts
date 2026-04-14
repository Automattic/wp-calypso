import debug from './debug';

let isSuppressed = false;

/**
 * Suppresses or unsuppresses Survicate event invocations.
 * When suppressed, `invokeSurvicateEvent` returns a no-op without firing.
 */
export function setSurvicateEventSuppression( suppressed: boolean ): void {
	isSuppressed = suppressed;
	debug( 'Survicate event suppression set to %s', suppressed );

	// if survicate is open, close it immediately
	if ( suppressed && typeof window._sva !== 'undefined' && window._sva.closeSurvey ) {
		window._sva.closeSurvey();
		debug( 'Survicate survey closed' );
	}
}

/**
 * Invokes a Survicate event by name.
 * If the SDK is already loaded, fires immediately. Otherwise waits for the
 * `SurvicateReady` window event before invoking.
 * @returns A cleanup function that removes the event listener.
 */
export function invokeSurvicateEvent( eventName: string ): () => void {
	if ( isSuppressed ) {
		debug( 'Survicate event suppressed. No event invoked.' );
		return () => {};
	}

	if ( typeof window._sva !== 'undefined' && window._sva.invokeEvent ) {
		window._sva.invokeEvent( eventName );
		return () => {};
	}

	const handler = () => {
		if ( typeof window._sva !== 'undefined' && window._sva.invokeEvent ) {
			window._sva.invokeEvent( eventName );
		}
	};

	window.addEventListener( 'SurvicateReady', handler, { once: true } );

	return () => {
		window.removeEventListener( 'SurvicateReady', handler );
	};
}
