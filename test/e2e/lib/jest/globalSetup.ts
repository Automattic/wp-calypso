import { mkdir, stat, access, unlink } from 'fs/promises';
import path from 'path';
import config from 'config';
import { chromium } from 'playwright';

// Save cookies for defaultUser.
export default async (): Promise< void > => {
	if ( process.env.SAVE_AUTH_COOKIES !== 'true' ) {
		return;
	}

	// If configuration file is not found, log a message and exit this setup.
	if ( config.util.equalsDeep( config.util.toObject(), {} ) ) {
		/*
		Must use a `console.error` here. Throwing an error would halt Jest execution
		and throw a wall of red text at the user.
		*/
		console.error( 'No decrypted configuration file was found.' );
		return;
	}

	// Create a directory to store the generated cookie file.
	// The cookie file will be stored in the `test/e2e/cookies` directory.
	const cookieBasePath = path.join( __dirname, '../../', 'cookies' );
	await mkdir( cookieBasePath, { recursive: true } );

	// Launch Chromium then retrieve the base URL for the environment we're testing.
	const browser = await chromium.launch();
	const calypsoBaseURL = config.get( 'calypsoBaseURL' );

	// This is important!
	// Jest does not permit values created in globalSetup/globalTeardown to be read
	// by the test suites themselves. See https://jestjs.io/docs/configuration#globalsetup-string.
	// As such the only way to communicate the cookie path to the test suites is to
	// set this environment variable and have the `@automattic/calypso-e2e` module check for
	// its presence when running each test file.
	process.env.COOKIES_PATH = cookieBasePath;

	const userList = [ 'gutenbergSimpleSiteUser', 'eCommerceUser', 'defaultUser' ];

	for await ( const user of userList ) {
		const cookiePath = path.join( cookieBasePath, `${ user }.json` );

		/*
		This section is nearly identical to the snippet in `BrowserManager.setLoginCookie`, but
		instead of checking that cookies are older than 3 days, this checks whether the cookies
		are newer than 3 days. If so, presumably the cookies are still good to use and the iteration
		is short-circuited.
		*/
		try {
			await access( cookiePath );
			const stats = await stat( cookiePath );
			const createdTime = Math.trunc( stats.birthtimeMs );
			const currentTime = new Date();

			if ( createdTime > currentTime.setDate( currentTime.getDate() - 3 ) ) {
				console.log( `\nCookie file on disk for ${ user } is recent, skipping.` );
				continue;
			} else {
				// Remove the stale cookie file as BrowserContext.storageState does not
				// overwrite files.
				await unlink( cookiePath );
			}
		} catch {
			// noop
		}

		const [ username, password ] = config.get( 'testAccounts' )[ user ];
		console.log( `${ user }: ${ username }, ${ password }` );

		// This is important!
		// If the e2e test user agent string is not set, log ins will fail to calypso.live
		// and wpcalypso.wordpress.com environments.
		const browserContext = await browser.newContext( {
			userAgent: `user-agent=Mozilla/5.0 (wp-e2e-tests) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${ browser.version() } Safari/537.36`,
		} );

		const page = await browserContext.newPage();
		await page.goto( `${ calypsoBaseURL }/log-in` );
		await page.fill( '#usernameOrEmail', username );
		await page.keyboard.press( 'Enter' );
		await page.fill( '#password', password );

		// Wait for the home dashboard to load.
		await Promise.all( [
			page.waitForURL( `${ calypsoBaseURL }/home/**`, { waitUntil: 'load' } ),
			page.click( 'button:has-text("Log In")' ),
		] );

		// Save signed-in state.
		await page.context().storageState( { path: cookiePath } );
	}

	// Close context.
	await browser.close();
	return;
};
