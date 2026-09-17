export * from './api-cancel-atomic-plan';
export * from './api-close-account';
export * from './api-create-free-site';
export * from './api-delete-site';
export * from './api-wait-for-account-propagation';
export * from './swap-base-url';

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
