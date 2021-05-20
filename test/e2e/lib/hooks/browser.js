/**
 * External dependencies
 */
import config from 'config';

/**
 * Internal dependencies
 */
import { quitBrowser, startBrowser, ensureNotLoggedIn } from '../driver-manager';

const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );

export const closeBrowser = async function () {
	await quitBrowser( this.driver );
};

export async function createBrowser() {
	this.timeout( startBrowserTimeoutMS );
	this.driver = await startBrowser();
	await ensureNotLoggedIn( this.driver );
}
