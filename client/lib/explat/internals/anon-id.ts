import {
	getCurrentUser,
	recordTracksEvent,
	getTracksAnonymousUserId,
	getTracksLoadPromise,
} from '@automattic/calypso-analytics';
import { logError } from './log-error';

// SSR safety: Fail TypeScript compilation if `window` is used without an explicit undefined check
declare const window: undefined | ( Window & typeof globalThis );

/**
 * setInterval, but it runs first callback immediately instead of after interval.
 * @param f The callback function
 * @param intervalMs The interval in milliseconds
 */
const immediateStartSetInterval = ( f: () => void, intervalMs: number ) => {
	f();
	return setInterval( f, intervalMs );
};

let initializeAnonIdPromise: null | Promise< string | null > = null;
const anonIdPollingIntervalMilliseconds = 50;
const anonIdPollingIntervalMaxAttempts = 100; // 50 * 100 = 5000 = 5 seconds
/**
 * Initializes the anonId:
 * - Polls for AnonId receival
 * - Should only be called once at startup
 * - Happens to be safe to call multiple times if it is necessary to reset the anonId - something like this was necessary for testing.
 *
 * This purely for boot-time initialization, in usual circumstances it will be retrieved within 100-300ms, it happens in parallel booting
 * so should only delay experiment loading that much for boot-time experiments. In some circumstances such as a very slow connection this
 * can take a lot longer.
 *
 * The state of initializeAnonIdPromise should be used rather than the return of this function.
 * The return is only avaliable to make this easier to test.
 *
 * Throws on error.
 */
export const initializeAnonId = async (): Promise< string | null > => {
	if ( typeof window === 'undefined' ) {
		logError( { message: 'Trying to initialize anonId outside of a browser context.' } );
		return null;
	}

	recordTracksEvent( 'calypso_explat_initialization' );

	let attempt = 0;
	initializeAnonIdPromise = new Promise( ( res ) => {
		let anonIdPollingInterval: NodeJS.Timeout;
		// eslint-disable-next-line prefer-const
		anonIdPollingInterval = immediateStartSetInterval( () => {
			const anonId = getTracksAnonymousUserId();
			if ( typeof anonId === 'string' && anonId !== '' ) {
				clearInterval( anonIdPollingInterval );
				res( anonId );
				return;
			}

			if ( anonIdPollingIntervalMaxAttempts - 1 <= attempt || getCurrentUser() ) {
				clearInterval( anonIdPollingInterval );
				res( null );
				return;
			}
			attempt = attempt + 1;
		}, anonIdPollingIntervalMilliseconds );

		// Tracks can fail to load, e.g. because of an ad-blocker
		getTracksLoadPromise().catch( () => {
			clearInterval( anonIdPollingInterval );
			res( null );
		} );
	} );

	return initializeAnonIdPromise;
};

/**
 * Returns a user's anonId if they have.
 *
 * Safe in SSR, never throws in production.
 */
export const getAnonId = async (): Promise< string | null > => {
	if ( typeof window === 'undefined' ) {
		logError( { message: 'Trying to getAnonId in non browser context.' } );
		return null;
	}

	if ( initializeAnonIdPromise === null ) {
		logError( { message: 'AnonId initialization should have started before this function call.' } );
	}

	try {
		return await initializeAnonIdPromise;
	} catch ( e ) {
		// We log errors on initializeAnonIdPromise and not here to prevent duplicates
		// and keep things simple. It is safe to return null in an error case as we
		// log those on the server.
	}

	return null;
};
