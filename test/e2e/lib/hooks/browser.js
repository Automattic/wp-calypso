/**
 * Internal dependencies
 */
import { quitBrowser } from '../driver-manager';

export const closeBrowser = async () => {
	if ( ! global.__BROWSER__ ) {
		// Early return if there's no browser, i.e. when all specs were skipped.
		return;
	}

	const driver = global.__BROWSER__;
	await quitBrowser( driver );
};
