import { generateUUID } from './generate-uuid';

// AM-owned keys in `sessionStorage`: the flow is tab-local (this tab
// navigates, this tab resumes), and the tab scope keeps another tab's chat —
// which holds a different tab session — from reading or clearing a
// navigation that is not its own.
const NAVIGATION_STORAGE_KEY = 'agents-manager-pending-navigation';
const CONTINUATION_SENT_KEY = 'agents-manager-navigation-continuation-sent';

// A navigation older than this is a leftover, not a resume.
const NAVIGATION_EXPIRY_MS = 5 * 60 * 1000;

// Identifies this page load. Stamped into the saved navigation (only a
// different load can witness an arrival) and onto the sent flag (a flag from
// another load with the navigation still pending means that send was
// interrupted, which the destination page uses to correct a false decline).
const PAGE_LOAD_ID = generateUUID();

// Dispatched on save and re-dispatched by the navigate callback at redirect
// time — saving changes no React state, so the hook listens for this to arm
// its `beforeunload` probe.
export const NAVIGATION_PENDING_EVENT = 'agents-manager-navigation-pending';

interface NavigationState {
	/** The requested wp-admin path, used to report whether the reload landed on it. */
	destination: string;
	/** The page the navigation left from, used to report a redirect the user declined. */
	origin: string;
	/** The page load that created the navigation — see `wasNavigationCreatedThisLoad`. */
	pageLoadId?: string;
	timestamp: number;
	sessionId: string;
	toolCallId?: string;
	toolId?: string;
}

/**
 * Saves the state `useNavigationContinuation` resumes from after the reload.
 * Returns whether the save succeeded — without it the parked call could never
 * be answered, so the caller must not navigate.
 */
export function savePendingNavigation(
	destination: string,
	sessionId: string,
	toolCallId?: string,
	toolId?: string
): boolean {
	const state: NavigationState = {
		destination,
		origin: window.location.pathname + window.location.search,
		pageLoadId: PAGE_LOAD_ID,
		timestamp: Date.now(),
		sessionId,
		toolCallId,
		toolId,
	};

	try {
		sessionStorage.setItem( NAVIGATION_STORAGE_KEY, JSON.stringify( state ) );
		window.dispatchEvent( new Event( NAVIGATION_PENDING_EVENT ) );
		return true;
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.error( '[AgentsManager] Error storing the navigation state:', error );
		return false;
	}
}

/** The pending navigation, or `null` when there is none or it has expired. */
export function getPendingNavigation(): NavigationState | null {
	try {
		const stored = sessionStorage.getItem( NAVIGATION_STORAGE_KEY );
		if ( ! stored ) {
			return null;
		}

		const state: NavigationState = JSON.parse( stored );
		if ( Date.now() - state.timestamp > NAVIGATION_EXPIRY_MS ) {
			sessionStorage.removeItem( NAVIGATION_STORAGE_KEY );
			return null;
		}

		return state;
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.error( '[AgentsManager] Error retrieving the navigation state:', error );
		return null;
	}
}

/**
 * Whether the given navigation was created by this page load. Only a
 * different load — one that began after the redirect — can witness an
 * arrival: on the creating page neither a URL substring match nor a
 * history-API rewrite proves the browser navigated.
 */
export function wasNavigationCreatedThisLoad( state: NavigationState ): boolean {
	return state.pageLoadId === PAGE_LOAD_ID;
}

/**
 * Whether the given navigation's continuation was already sent — the flag
 * survives remounts (including StrictMode double-renders), unlike a ref.
 */
export function isContinuationSent( state: NavigationState ): boolean {
	try {
		const stored = sessionStorage.getItem( CONTINUATION_SENT_KEY );
		return stored?.split( ':' )[ 0 ] === String( state.timestamp );
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.error( '[AgentsManager] Error reading the continuation sent flag:', error );
		return false;
	}
}

/**
 * Whether the given navigation's sent flag was written by this page load —
 * when the flag is set for this navigation, false means another load's
 * interrupted send wrote it.
 */
export function wasContinuationSentThisLoad( state: NavigationState ): boolean {
	try {
		return (
			sessionStorage.getItem( CONTINUATION_SENT_KEY ) === `${ state.timestamp }:${ PAGE_LOAD_ID }`
		);
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.error( '[AgentsManager] Error reading the continuation sent flag:', error );
		return false;
	}
}

/** Marks the given navigation's continuation as sent by this page load. */
export function markContinuationSent( state: NavigationState ): void {
	try {
		sessionStorage.setItem( CONTINUATION_SENT_KEY, `${ state.timestamp }:${ PAGE_LOAD_ID }` );
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.error( '[AgentsManager] Error marking the continuation as sent:', error );
	}
}

/**
 * Unmarks the given navigation's sent flag, so a later mount can retry a
 * failed send. A successor navigation's flag is left in place.
 */
export function unmarkContinuationSent( state: NavigationState ): void {
	try {
		clearContinuationSentFor( state.timestamp );
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.error( '[AgentsManager] Error unmarking the continuation as sent:', error );
	}
}

// Clears the sent flag only when it belongs to the given navigation (or no
// flag exists) — a late clear must not erase a successor's flag.
function clearContinuationSentFor( timestamp: number ): void {
	const sentFor = sessionStorage.getItem( CONTINUATION_SENT_KEY )?.split( ':' )[ 0 ];
	if ( ! sentFor || sentFor === String( timestamp ) ) {
		sessionStorage.removeItem( CONTINUATION_SENT_KEY );
	}
}

/**
 * Clears the given navigation's state and sent flag. A successor navigation's
 * fresher state — and its sent flag — are left in place for its own page to
 * answer: a late-resolving send must not delete either.
 */
export function completePendingNavigation( state: NavigationState ): void {
	try {
		clearContinuationSentFor( state.timestamp );

		const stored = sessionStorage.getItem( NAVIGATION_STORAGE_KEY );
		if ( stored && ( JSON.parse( stored ) as NavigationState ).timestamp !== state.timestamp ) {
			return;
		}
		sessionStorage.removeItem( NAVIGATION_STORAGE_KEY );
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.error( '[AgentsManager] Error clearing the navigation state:', error );
	}
}

/**
 * Whether the given navigation belongs to the given session. Empty stored or
 * current ids pass — navigation can run before the session is persisted; an
 * actual mismatch is skipped so the continuation cannot split the chat.
 */
export function isNavigationSessionValid(
	state: NavigationState,
	currentSessionId: string
): boolean {
	if ( ! state.sessionId || ! currentSessionId ) {
		return true;
	}

	if ( state.sessionId !== currentSessionId ) {
		// eslint-disable-next-line no-console
		console.warn(
			'[AgentsManager] Navigation session mismatch — skipping the continuation:',
			`stored=${ state.sessionId }`,
			`current=${ currentSessionId }`
		);
		return false;
	}

	return true;
}
