/**
 * WordPress dependencies
 */
import wpcom from 'calypso/lib/wp';

/**
 * Internal dependecies
 */
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { tracksAnonymousUserId } from 'calypso/lib/analytics/ad-tracking';
import userUtils from 'calypso/lib/user/utils';

// Using typescript to ensure we are being safe in SSR
declare const window: undefined | ( Window & typeof globalThis );
// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare const document: undefined | Document;

export const isDevelopmentMode = process.env.NODE_ENV === 'development';

/**
 * Log an error to the server.
 * Works in SSR.
 *
 * @param error Error to save
 */
export const logError = ( error: Record< string, string > & { message: string } ): void => {
	try {
		if ( isDevelopmentMode ) {
			// eslint-disable-next-line no-console
			console.error( '[ExPlat]', error.message, error );
		}

		error[ 'exPlatStandaloneClient' ] = 'calypso';

		if ( typeof window === 'undefined' ) {
			// We console.log in SSR contexts, this get's sent to logStash
			// eslint-disable-next-line no-console
			console.log( '[ExPlat]', error.message, error );
		} else {
			const body = new window.FormData();
			body.append( 'error', JSON.stringify( error ) );

			// TODO: Use wp.req.post here too
			window.fetch( 'https://public-api.wordpress.com/rest/v1.1/js-error', {
				method: 'POST',
				body,
			} );
		}
	} catch {
		if ( isDevelopmentMode ) {
			// eslint-disable-next-line no-console
			console.error( '[ExPlat] Unable to send error to server.' );
		}
	}
};

export const fetchExperimentAssignment = ( {
	experimentName,
	anonId,
}: {
	experimentName: string;
	anonId: string | null;
} ): Promise< unknown > => {
	return wpcom.req.get(
		{
			path: '/experiments/0.1.0/assignments/wpcom',
			apiNamespace: 'wpcom/v2',
		},
		{
			experiment_name: experimentName,
			anon_id: anonId ?? undefined,
		}
	);
};

let isInitializingAnonId = false;
const anonIdPollingIntervalMilliseconds = 50;
const anonIdPollingIntervalMaxAttempts = 100; // 50 * 100 = 5000 = 5 seconds
const initializeAnonId = async (): Promise< string | null > => {
	// This should only run once:
	if ( isInitializingAnonId ) {
		throw new Error( `Initializing AnonId more than once. This shouldn't occur.` );
	}
	isInitializingAnonId = true;

	if ( typeof window === 'undefined' || typeof document === 'undefined' ) {
		throw new Error( 'Trying to initialize anonId outside of a browser context.' );
	}

	recordTracksEvent( 'calypso_explat_initialization' );

	let attempts = 0;
	return new Promise( ( res ) => {
		const anonIdPollingInterval = setInterval( () => {
			if ( attempts > anonIdPollingIntervalMaxAttempts ) {
				clearInterval( anonIdPollingInterval );
				// This will fail if the user is logged in.
				res( null );
			}
			attempts = attempts + 1;

			const anonId = tracksAnonymousUserId();
			if ( typeof anonId === 'string' && anonId !== '' ) {
				clearInterval( anonIdPollingInterval );
				res( anonId );
			}
		}, anonIdPollingIntervalMilliseconds );
	} );
};

// We initialize the anonId at boot, wrapped so that we can log errors:
let initializeAnonIdPromise: null | Promise< string | null > = null;
if ( typeof window !== 'undefined' && typeof document !== 'undefined' ) {
	( async () => {
		try {
			initializeAnonIdPromise = initializeAnonId();
			await initializeAnonIdPromise;
		} catch ( e ) {
			logError( { message: e.message } );
		}
	} )();
}

export const getAnonId = async (): Promise< string | null > => {
	if ( userUtils.isLoggedIn() ) {
		return null;
	}

	if ( initializeAnonIdPromise === null ) {
		throw new Error( 'AnonId initialization should have already started.' );
	}

	try {
		return await initializeAnonIdPromise;
	} catch ( e ) {
		// We log errors above so we don't need to log them here
		// and to keep things simple we return null if there is an error.
	}

	return null;
};
