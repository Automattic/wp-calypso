import wpcom from 'calypso/lib/wp';

const MAX_TRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const isErrorResponse = ( response ) => {
	return response?.body?.error || response?.code >= 400;
};

export async function rawCurrentUserFetch( { retry = false } = {} ) {
	let retryCount = 0;
	let lastError;
	const maxRetries = retry ? MAX_TRIES : 0;

	while ( retryCount <= maxRetries ) {
		try {
			const response = await wpcom.req.get( '/me', { meta: 'flags' } );

			if ( isErrorResponse( response ) ) {
				throw response;
			}

			return response;
		} catch ( error ) {
			lastError = error;
			retryCount++;

			if ( retryCount > maxRetries ) {
				break;
			}

			await new Promise( ( resolve ) => setTimeout( resolve, RETRY_DELAY ) );
		}
	}

	throw lastError;
}
