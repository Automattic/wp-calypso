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
 * Includes a delay to allow the Survicate SDK to initialize after script load.
 */
export function setSurvicateVisitorTraits( traits: { email: string } ): void {
	window.addEventListener( 'SurvicateReady', function () {
		if ( typeof window._sva !== 'undefined' && window._sva.setVisitorTraits ) {
			window._sva.setVisitorTraits( traits );
		}
	} );
}

/**
 * Adds a listener for the survey_closed event and destroys the visitor if the survey is closed.
 */
export function addSurvicateSurveyClosedListener(): void {
	window.addEventListener( 'SurvicateReady', function () {
		if ( typeof window._sva !== 'undefined' && window._sva?.addEventListener ) {
			window._sva?.addEventListener( 'survey_closed', function () {
				window._sva?.destroyVisitor?.();
			} );
		}
	} );
}
