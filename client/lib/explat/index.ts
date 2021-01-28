/**
 * WordPress dependencies
 */
import wpcom from 'calypso/lib/wp';
import { createExPlatClient } from '@automattic/explat-client';

/**
 * Internal dependecies
 */
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getAnonIdFromCookie } from 'calypso/state/experiments/reducer';

const isDevelopmentMode = process.env.NODE_ENV === 'development';

const logError = ( error: Record< string, string > & { message: string } ) => {
	if ( isDevelopmentMode ) {
		// eslint-disable-next-line no-console
		console.error( '[ExPlat]', error.message, error );
	}

	error[ 'exPlatStandaloneClient' ] = 'calypso';

	const body = new window.FormData();
	body.append( 'error', JSON.stringify( error ) );

	try {
		// TODO: Use wp.req.post here too
		window.fetch( 'https://public-api.wordpress.com/rest/v1.1/js-error', {
			method: 'POST',
			body,
		} );
	} catch {
		if ( isDevelopmentMode ) {
			// eslint-disable-next-line no-console
			console.error( '[ExPlat] Unable to send error to server.' );
		}
	}
};

const fetchExperimentAssignment = ( {
	experimentName,
	anonId,
}: {
	experimentName: string;
	anonId?: string;
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
const getAnonId = async (): Promise< string | null > => {
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

const ExPlatClient = createExPlatClient( {
	fetchExperimentAssignment,
	getAnonId,
	logError,
	isDevelopmentMode,
} );

export default ExPlatClient;
