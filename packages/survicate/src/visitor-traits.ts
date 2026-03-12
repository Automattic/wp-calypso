declare global {
	interface Window {
		_sva?: {
			setVisitorTraits?: ( traits: Record< string, string > ) => void;
			addEventListener?: ( event: string, handler: () => void ) => void;
			removeEventListener?: ( event: string, handler: () => void ) => void;
			invokeEvent?: ( event: string ) => void;
			destroyVisitor?: () => void;
		};
	}
}

/**
 * Sets Survicate visitor traits (e.g. email) on the global `_sva` object.
 * Waits for the `SurvicateReady` window event before setting traits.
 * @returns A cleanup function that removes the event listener.
 */
export function setSurvicateVisitorTraits( traits: { email: string } ): () => void {
	const handler = function () {
		if ( typeof window._sva !== 'undefined' && window._sva.setVisitorTraits ) {
			window._sva.setVisitorTraits( traits );
		}
	};

	window.addEventListener( 'SurvicateReady', handler, { once: true } );

	return () => {
		window.removeEventListener( 'SurvicateReady', handler );
	};
}
