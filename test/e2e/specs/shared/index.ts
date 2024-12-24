export * from './api-close-account';
export * from './api-delete-site';

/**
 * This is a fix for e2e test that was deployed on Christmas eve as an emergency fix. Please remove and fix the root cause.
 * @param callback the attempt callback
 * @param retries number of retries.
 */
export async function fixme_retry( callback: () => unknown, retries: number = 5 ) {
	let count = retries;
	while ( count-- ) {
		try {
			return await callback();
		} catch ( e ) {
			if ( ! --count ) {
				throw e;
			}
			await new Promise( ( r ) => setTimeout( r, 1000 ) );
		}
	}
}
