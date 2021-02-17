/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { tracksAnonymousUserId } from 'calypso/lib/analytics/ad-tracking';
import userUtils from 'calypso/lib/user/utils';
import { logError, isDevelopmentMode } from './log-error';

// Using typescript to ensure we are being safe in SSR
declare const window: undefined | ( Window & typeof globalThis );

let initializeAnonIdPromise: null | Promise< string | null > = null;
const anonIdPollingIntervalMilliseconds = 50;
const anonIdPollingIntervalMaxAttempts = 100; // 50 * 100 = 5000 = 5 seconds
/**
 * Initialized the anonId
 * - Polls for AnonId receival
 * - Should only be called once at startup
 * - Happens to be safe to call multiple times if it is necessary to reset it
 *
 * The state of initializeAnonIdPromise should be used rather than the return of this function.
 * The return is avaliable to make this easier to test.
 *
 * Throws on error.
 */
export const initializeAnonId = async (): Promise< string | null > => {
	if ( typeof window === 'undefined' ) {
		throw new Error( 'Trying to initialize anonId outside of a browser context.' );
	}

	recordTracksEvent( 'calypso_explat_initialization' );

	let attempt = 0;
	initializeAnonIdPromise = new Promise( ( res ) => {
		const anonIdPollingInterval = setInterval( () => {
			if ( attempt > anonIdPollingIntervalMaxAttempts - 1 || userUtils.isLoggedIn() ) {
				clearInterval( anonIdPollingInterval );
				res( null );
				return;
			}
			attempt = attempt + 1;

			const anonId = tracksAnonymousUserId();
			if ( typeof anonId === 'string' && anonId !== '' ) {
				clearInterval( anonIdPollingInterval );
				res( anonId );
			}
		}, anonIdPollingIntervalMilliseconds );
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

	// Check setup
	if ( isDevelopmentMode && initializeAnonIdPromise === null ) {
		throw new Error( 'AnonId initialization should have already started.' );
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
