/* eslint-disable mocha/no-top-level-hooks */

/**
 * External dependencies
 */
import { BrowserManager } from '@automattic/calypso-e2e';

/**
 * Hook to terminate a Browser instance.
 *
 * @returns {void} No return value.
 */
after( 'Close browser', async function () {
	await BrowserManager.browser.close();
} );
