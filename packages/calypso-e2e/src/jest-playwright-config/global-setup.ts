/* eslint-disable require-jsdoc */
import path from 'path';
import { chromium } from 'playwright';
import { TestAccount } from '../lib/test-account';
import pwConfig from './playwright-config';

const DEFAULT_COOKIES_PATH = path.join( __dirname, '../../', 'cookies' );

export default async (): Promise< void > => {
	const { SAVE_AUTH_COOKIES, COOKIES_PATH } = process.env;

	if ( SAVE_AUTH_COOKIES && SAVE_AUTH_COOKIES !== 'false' ) {
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

		const browser = await chromium.launch( pwConfig.launchOptions );

		await Promise.all(
			testAccounts.map( async ( accountName ) => {
				const testAccount = new TestAccount( accountName );
				if ( await testAccount.hasFreshAuthCookies() ) {
					return;
				}

				const page = await browser.newPage( pwConfig.contextOptions );

				await testAccount.logInViaLoginPage( page );
				await testAccount.saveAuthCookies( page.context() );

				await page.close();
			} )
		);

		await browser.close();
	}
};
