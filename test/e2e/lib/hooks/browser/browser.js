import { quitBrowser, startBrowser, ensureNotLoggedIn } from '../../driver-manager';

export const closeBrowser = async function ( { driver } ) {
	await quitBrowser( driver );
};

export async function createBrowser( { tempDir } ) {
	const driver = await startBrowser( { tempDir } );
	await ensureNotLoggedIn( driver );
	return driver;
}
