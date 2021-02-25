/**
 * WordPress dependencies
 */
import { getLogger } from 'calypso/server/lib/logger';

// Using typescript to ensure we are being safe in SSR
declare const window: undefined | ( Window & typeof globalThis );

export const isDevelopmentMode = process.env.NODE_ENV === 'development';

/**
 * Log an error to the server.
 * Works in SSR.
 *
 * Should never throw.
 *
 * @param error Error to save
 */
export const logError = (
	error: Record< string, string > & { message: string; properties?: Record< string, unknown > }
): void => {
	const onError = ( e: unknown ) => {
		if ( isDevelopmentMode ) {
			// eslint-disable-next-line no-console
			console.error( '[ExPlat] Unable to send error to server:', e );
		}
	};

	try {
		error[ 'properties' ] = {
			...( error?.[ 'properties' ] || {} ),
			context: 'explat',
			explat_client: 'calypso',
		};

		if ( typeof window === 'undefined' ) {
			// Bunyan logger will log to the console in development mode.
			getLogger().error( error );
		} else if ( isDevelopmentMode ) {
			// eslint-disable-next-line no-console
			console.error( '[ExPlat] ', error.message, error );
		} else {
			const body = new window.FormData();
			body.append( 'error', JSON.stringify( error ) );
			window
				.fetch( 'https://public-api.wordpress.com/rest/v1.1/js-error', {
					method: 'POST',
					body,
				} )
				.catch( onError );
		}
	} catch ( e ) {
		onError( e );
	}
};
