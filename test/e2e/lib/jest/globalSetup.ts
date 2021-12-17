import fs from 'fs/promises';
import path from 'path';
import * as BrowserHelper from '@automattic/calypso-e2e/dist/esm/src/browser-helper';
import { LoginPage } from '@automattic/calypso-e2e/dist/esm/src/lib/pages/login-page';
import { chromium } from 'playwright';

async function createAuthCookiesForTestAccount( testAccount ): Promise< void > {
	const storageStateFilePath = path.join( process.env.COOKIES_PATH, `${ testAccount }.json` );
	let hasFreshCookies;

	try {
		const { birthtimeMs } = await fs.stat( storageStateFilePath );
		hasFreshCookies = birthtimeMs > Date.now() - 3 * 24 * 60 * 60 * 1000; // less than 3 days
	} catch {
		hasFreshCookies = false;
	}

	if ( ! hasFreshCookies ) {
		console.info( `\nCreating auth cookies for "${ testAccount }"` );

		/**
		 * Login via UI to create fresh cookies
		 */
		const browser = await chromium.launch();
		const { userAgent } = BrowserHelper.getLaunchConfiguration( browser.version() );
		const browserContext = await browser.newContext( { userAgent } );
		const page = await browserContext.newPage();
		const loginPage = new LoginPage( page );

		await loginPage.visit();
		await loginPage.logInWithTestAccount( testAccount );

		/**
		 * Save the storage state file containing created cookies.
		 */
		await browserContext.storageState( { path: storageStateFilePath } );
		await browser.close();
	}
}

export default async function globalSetup(): Promise< void > {
	if ( process.env.SAVE_AUTH_COOKIES === 'true' ) {
		process.env.COOKIES_PATH = path.join( __dirname, '../../', 'cookies' );

		const commonTestAccounts = [ 'simpleSitePersonalPlanUser', 'eCommerceUser', 'defaultUser' ];
		await Promise.all( commonTestAccounts.map( createAuthCookiesForTestAccount ) );
	}
}
