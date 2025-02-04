import wpcom from 'calypso/lib/wp';
import { getLogger } from 'calypso/server/lib/logger';
import { isDevelopmentMode } from './misc';

// SSR safety: Fail TypeScript compilation if `window` is used without an explicit undefined check
declare const window: undefined | ( Window & typeof globalThis );

/**
 * Log an error to the server.
 * Works in SSR.
 *
 * Should never throw.
 * @param error Error to save
 */
export const logError = ( error: Record< string, string > & { message: string } ): void => {
	const onError = ( e: unknown ) => {
		if ( isDevelopmentMode ) {
			// eslint-disable-next-line no-console
			console.error( '[ExPlat] Unable to send error to server:', e );
		}
	};

	try {
		const { message, ...properties } = error;
		const logStashError = {
			message,
			properties: {
				...properties,
				context: 'explat',
				explat_client: 'calypso',
				message,
			},
		};

		if ( typeof window === 'undefined' ) {
			// Bunyan logger will log to the console in development mode.
			getLogger().error( logStashError );
		} else if ( isDevelopmentMode ) {
			// eslint-disable-next-line no-console
			console.error( '[ExPlat] ', error.message, error );
		} else {
			wpcom.req.post(
				{
					path: '/js-error',
					apiNamespace: 'rest/v1.1',
					body: {
						error: JSON.stringify( logStashError ),
					},
				},
				( err: unknown ) => err && onError( err )
			);
		}
	} catch ( e ) {
		onError( e );
	}
};
