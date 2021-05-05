/* eslint-disable mocha/no-top-level-hooks */

/**
 * External dependencies
 */
import config from 'config';
import { BrowserManager } from '@automattic/calypso-e2e';

const playwrightTimeoutMS = config.get( 'playwrightTimeoutMS' );

/**
 * Hook to launch a new instance of BrowserContext then a new
 * Page for testing.
 *
 * @returns {void} No return value.
 */
before( 'Launch browser instance', async function () {
	this.browserContext = await BrowserManager.newBrowserContext();
	await this.browserContext.setDefaultTimeout( playwrightTimeoutMS );
	this.page = await this.browserContext.newPage();
} );

/**
 * Hook to terminate a Browser instance.
 *
 * @returns {void} No return value.
 */
after( 'Close browser', async function () {
	await BrowserManager.browser.close();
} );
