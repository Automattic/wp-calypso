import { mkdir } from 'fs/promises';
import path from 'path';
import config from 'config';
import { chromium } from 'playwright';

// Save cookies for defaultUser.
export default async (): Promise< void > => {
	if ( process.env.SAVE_AUTH_COOKIES !== 'true' ) {
		return;
	}

	const browser = await chromium.launch();
	const calypsoBaseURL = config.get( 'calypsoBaseURL' );
	const cookieBasePath = path.join( process.cwd(), 'cookies' );
	process.env.COOKIES_PATH = cookieBasePath;
	await mkdir( cookieBasePath, { recursive: true } );

	const userList = [ 'gutenbergSimpleSiteUser', 'wooCommerceUser', 'defaultUser' ];

	for await ( const user of userList ) {
		const [ username, password ] = config.get( 'testAccounts' )[ user ];

		const browserContext = await browser.newContext( {
			userAgent: `user-agent=Mozilla/5.0 (wp-e2e-tests) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${ browser.version() } Safari/537.36`,
		} );
		const page = await browserContext.newPage();

		await page.goto( `${ calypsoBaseURL }/log-in` );
		await page.fill( '#usernameOrEmail', username );
		await page.keyboard.press( 'Enter' );
		await page.fill( '#password', password );

		// Wait for the login to complete.
		await Promise.all( [
			page.waitForURL( `${ calypsoBaseURL }/home/**`, { waitUntil: 'load' } ),
			page.click( 'button:has-text("Log In")' ),
		] );

		// Save signed-in state.
		const cookiePath = path.join( cookieBasePath, `${ user }.json` );
		await page.context().storageState( { path: cookiePath } );
	}

	// Close context.
	await browser.close();
	return;
};
