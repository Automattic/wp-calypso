/* eslint-disable mocha/no-top-level-hooks */

/**
 * External dependencies
 */
import { BrowserManager } from '@automattic/calypso-e2e';

/**
 * Hook to launch browser instance and set up the environment.
 *
 * @returns {void} No return value.
 */
before( async function startBrowser() {
	this.page = await BrowserManager.start();
} );

/**
 * Hook to terminate a Browser instance.
 *
 * @returns {void} No return value.
 */
after( 'Close browser', async function () {
	await BrowserManager.browser.close();
} );
