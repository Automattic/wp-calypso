let isSuppressed = false;

/**
 * Suppresses or unsuppresses Survicate event invocations.
 * When suppressed, `invokeSurvicateEvent` returns a no-op without firing.
 */
export function setSurvicateEventSuppression( suppressed: boolean ): void {
	isSuppressed = suppressed;
}

/**
 * Invokes a Survicate event by name.
 * If the SDK is already loaded, fires immediately. Otherwise waits for the
 * `SurvicateReady` window event before invoking.
 * @returns A cleanup function that removes the event listener.
 */
export function invokeSurvicateEvent( eventName: string ): () => void {
	if ( isSuppressed ) {
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
