import path from 'path';
// We need to import directly because otherwise Jest throws the "Do not import
// `@jest/globals` outside of the Jest test environment" error. This happens
// because the index file of the calypso-e2e package imports/exports some
// modules that use the globals package, e.g. the lib/jest-conditionals.
import { getLaunchConfiguration } from '@automattic/calypso-e2e/dist/esm/src/browser-helper';
import { TestAccount } from '@automattic/calypso-e2e/dist/esm/src/lib/test-account';
import { chromium } from 'playwright';

const DEFAULT_COOKIES_PATH = path.join( __dirname, '../../', 'cookies' );

export default async function globalSetup(): Promise< void > {
	const { SAVE_AUTH_COOKIES, COOKIES_PATH } = process.env;

	if ( SAVE_AUTH_COOKIES !== 'false' ) {
		if ( ! COOKIES_PATH ) {
			process.env.COOKIES_PATH = DEFAULT_COOKIES_PATH;
		}

		/*
		 * Instead of just passing 'true' with the SAVE_AUTH_COOKIES var, you can
		 * also use it to define account(s) you want to pre-authenticate, e.g.:
		 *
		 * > SAVE_AUTH_COOKIES=p2User,i18nUser
		 *
		 * Otherwise, the default list of common test accounts will be used.
		 */
		const commonTestAccounts = [ 'simpleSitePersonalPlanUser', 'eCommerceUser', 'defaultUser' ];
		const testAccounts =
			SAVE_AUTH_COOKIES !== 'true' ? SAVE_AUTH_COOKIES.split( ',' ) : commonTestAccounts;

		if ( testAccounts.length === 0 ) {
			throw new Error( 'Invalid SAVE_AUTH_COOKIES value' );
		}

		const browser = await chromium.launch();
		const { userAgent } = getLaunchConfiguration( browser.version() );

		await Promise.all(
			testAccounts.map( async ( accountName ) => {
				const testAccount = new TestAccount( accountName );
				const browserContext = await browser.newContext( { userAgent } );
				const page = await browserContext.newPage();

				if ( await testAccount.hasFreshAuthCookies() ) {
					return;
				}

				await testAccount.logInViaLoginPage( page );
				await testAccount.saveAuthCookies( browserContext );
			} )
		);

		await browser.close();
	}
}
