/* eslint-disable mocha/no-top-level-hooks */

/**
 * External dependencies
 */
import { BrowserManager } from '@automattic/calypso-e2e';

/**
 * Hook to launch a Browser and obtain the BrowserContext.
 *
 * @returns {void} No return value.
 */
before( 'Launch browser instance', async function () {
	this.browserContext = await BrowserManager.newBrowserContext();
} );

/**
 * Hook to terminate a Browser instance.
 *
 * @returns {Promise<void>} Void promise.
 */
after( 'Close browser', function () {
	return BrowserManager.browser.close();
} );
