import debug from './debug';

declare global {
	interface Window {
		_sva?: {
			setVisitorTraits?: ( traits: Record< string, string | number > ) => void;
			addEventListener?: ( event: string, handler: () => void ) => void;
			removeEventListener?: ( event: string, handler: () => void ) => void;
			invokeEvent?: ( event: string ) => void;
			closeSurvey?: () => void;
			destroyVisitor?: () => void;
		};
	}
}

const DAY_IN_MS = 86400000;

/**
 * Returns the number of whole days between a given date and now.
 */
export function getAccountAgeInDays( registrationDate: string ): number {
	return Math.floor( ( Date.now() - new Date( registrationDate ).getTime() ) / DAY_IN_MS );
}

/**
 * Sets Survicate visitor traits (e.g. email) on the global `_sva` object.
 * If the Survicate API is already available, sets traits immediately.
 * Otherwise, waits for the `SurvicateReady` window event before setting traits.
 * @returns A cleanup function that removes the event listener.
 */
export function setSurvicateVisitorTraits( traits: {
	email: string;
	account_age_in_days?: number;
} ): () => void {
	const setTraits = function () {
		if ( typeof window._sva !== 'undefined' && window._sva.setVisitorTraits ) {
			window._sva.setVisitorTraits( traits );
			debug( 'Visitor traits set: %o', traits );
		}
	};

	// If Survicate is already loaded, set traits immediately.
	if ( typeof window._sva !== 'undefined' && window._sva.setVisitorTraits ) {
		setTraits();
		return () => {};
	}

	debug( 'Survicate not ready, deferring visitor traits until SurvicateReady event' );
	window.addEventListener( 'SurvicateReady', setTraits, { once: true } );

	return () => {
		window.removeEventListener( 'SurvicateReady', setTraits );
	};
}
