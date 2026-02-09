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

const VISITOR_TRAITS_DELAY_MS = 1000;

/**
 * Sets Survicate visitor traits (e.g. email) on the global `_sva` object.
 * Includes a delay to allow the Survicate SDK to initialize after script load.
 */
export function setSurvicateVisitorTraits( traits: { email: string } ): void {
	setTimeout( () => {
		if ( typeof window._sva !== 'undefined' && window._sva.setVisitorTraits ) {
			window._sva.setVisitorTraits( traits );
		}
	}, VISITOR_TRAITS_DELAY_MS );
}
