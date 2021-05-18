/**
 * External dependencies
 */
import config from 'config';

/**
 * Internal dependencies
 */
import { quitBrowser, startBrowser, ensureNotLoggedIn } from '../driver-manager';

const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );

export const closeBrowser = async () => {
	if ( ! global.__BROWSER__ ) {
		// Early return if there's no browser, i.e. when all specs were skipped.
		return;
	}

	const driver = global.__BROWSER__;
	await quitBrowser( driver );
};

export async function createBrowser() {
	this.timeout( startBrowserTimeoutMS );
	const driver = await startBrowser();
	await ensureNotLoggedIn( driver );
	global.__BROWSER__ = driver;
}
