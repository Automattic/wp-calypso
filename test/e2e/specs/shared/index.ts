import type { Locator } from 'playwright';

export * from './api-cancel-atomic-plan';
export * from './api-close-account';
export * from './api-create-free-site';
export * from './api-delete-site';
export * from './api-wait-for-account-propagation';
export * from './swap-base-url';

/**
 * Waits for a locator to become visible, and reports whether it did.
 *
 * `Locator.isVisible` answers for the current moment, so a screen that is still
 * rendering reads as "not visible" and a step conditional on it is silently
 * skipped. Use this wherever the app may simply not have painted yet.
 *
 * @param locator The locator to wait on.
 * @param timeout How long to wait, in milliseconds.
 */
export async function isVisibleWithin(
	locator: Locator,
	timeout: number = 15 * 1000
): Promise< boolean > {
	return locator.waitFor( { state: 'visible', timeout } ).then(
		() => true,
		() => false
	);
}

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
