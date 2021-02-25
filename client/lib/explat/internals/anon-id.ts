/**
 * WordPress dependencies
 */
import {
	recordTracksEvent,
	getTracksAnonymousUserId,
	getTracksLoadPromise,
} from '@automattic/calypso-analytics';

/**
 * Internal dependencies
 */
import userUtils from 'calypso/lib/user/utils';
import { logErrorOrThrowInDevelopmentMode } from './log-error';

// Using typescript to ensure we are being safe in SSR
declare const window: undefined | ( Window & typeof globalThis );

/**
 * setInterval, but it runs first callback immediately instead of after interval.
 *
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
 * Initialized the anonId
 * - Polls for AnonId receival
 * - Should only be called once at startup
 * - Happens to be safe to call multiple times if it is necessary to reset the anonId - something like this was necessary for testing.
 *
 * The state of initializeAnonIdPromise should be used rather than the return of this function.
 * The return is avaliable to make this easier to test.
 *
 * Throws on error.
 *
 * TODO: More error checking?
 * TODO: Better timing?
 * TODO: Maybe look further into the tracks event system to see if there is an alternative method for this.
 */
export const initializeAnonId = async (): Promise< string | null > => {
	if ( typeof window === 'undefined' ) {
		logErrorOrThrowInDevelopmentMode( 'Trying to initialize anonId outside of a browser context.' );
		return null;
	}

	recordTracksEvent( 'calypso_explat_initialization' );

	let attempt = 0;
	initializeAnonIdPromise = new Promise( ( res ) => {
		const anonIdPollingInterval = immediateStartSetInterval( () => {
			if ( attempt > anonIdPollingIntervalMaxAttempts - 1 || userUtils.isLoggedIn() ) {
				clearInterval( anonIdPollingInterval );
				res( null );
				return;
			}
			attempt = attempt + 1;

			const anonId = getTracksAnonymousUserId();
			if ( typeof anonId === 'string' && anonId !== '' ) {
				clearInterval( anonIdPollingInterval );
				res( anonId );
			}
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
		logErrorOrThrowInDevelopmentMode( 'Trying to getAnonId in non browser context.' );
		return null;
	}

	if ( initializeAnonIdPromise === null ) {
		logErrorOrThrowInDevelopmentMode(
			'AnonId initialization should have started before this function call.'
		);
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
