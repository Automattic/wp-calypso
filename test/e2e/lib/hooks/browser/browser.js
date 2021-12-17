import { quitBrowser, startBrowser, ensureNotLoggedIn } from '../../driver-manager.js';

export const closeBrowser = async function ( { driver } ) {
	await quitBrowser( driver );
};

export async function createBrowser() {
	const driver = await startBrowser();
	await ensureNotLoggedIn( driver );
	return driver;
}
