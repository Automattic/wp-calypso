/**
 * WordPress dependencies
 */
import wpcom from 'calypso/lib/wp';

/**
 * Internal dependecies
 */
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getAnonIdFromCookie } from 'calypso/state/experiments/reducer';

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

let hasTracksEventFiredToEnsureAnonIdInCookie = false;
export const getAnonId = async (): Promise< string | null > => {
	if ( typeof window === 'undefined' ) {
		logError( { message: 'Trying to retrieve anonId outside of a browser context.' } );
		return null;
	}

	if ( ! hasTracksEventFiredToEnsureAnonIdInCookie ) {
		recordTracksEvent( 'calypso_explat_first_experiment_fetch' );
		hasTracksEventFiredToEnsureAnonIdInCookie = true;
	}

	return getAnonIdFromCookie();
};
