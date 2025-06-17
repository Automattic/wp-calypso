import wpcom from 'calypso/lib/wp';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const isErrorResponse = ( response ) => {
	return response?.body?.error || response?.code >= 400;
};

export async function rawCurrentUserFetch() {
	let retryCount = 0;
	let lastError;

	while ( retryCount <= MAX_RETRIES ) {
		try {
			const response = await wpcom.req.get( '/me', { meta: 'flags' } );

			if ( isErrorResponse( response ) ) {
				throw response;
			}

			return response;
		} catch ( error ) {
			lastError = error;
			retryCount++;

			if ( retryCount > MAX_RETRIES ) {
				break;
			}

			await new Promise( ( resolve ) => setTimeout( resolve, RETRY_DELAY ) );
		}
	}

	throw lastError;
}
