/* eslint-disable mocha/no-top-level-hooks */

/**
 * External dependencies
 */
import { BrowserManager } from '@automattic/calypso-e2e';

/**
 * Terminates an instance of the Browser.
 *
 * When called, this function will unset the reference to the browser instance,
 * then call on the browser to terminate all instances of existing BrowserContexts.
 * Any open pages are also destroyed in this process.
 *
 * @returns {Promise<void>} Void promise.
 */
after( 'Close browser', function () {
	return BrowserManager.browser.close();
} );
