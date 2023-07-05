/* eslint-disable require-jsdoc */
import { chromium } from 'playwright';
import envVariables from '../env-variables';
import { TestAccount } from '../lib/test-account';
import pwConfig from './playwright-config';

export default async (): Promise< void > => {
	const { AUTHENTICATE_ACCOUNTS } = envVariables;

	// If running in the Pre-Release Tests environment in CI,
	// don't execute the cookie refresh.
	if ( process.env.NODE_CONFIG_ENV === 'pre-release' ) {
		return;
	}

	// If PWDEBUG mode is enabled (stepping through each step)
	// don't execute the cookie refresh.
	if ( process.env.PWDEBUG ) {
		return;
	}

	if ( AUTHENTICATE_ACCOUNTS.length > 0 ) {
		const browser = await chromium.launch( {
			...pwConfig.launchOptions,
			headless: true,
		} );

		await Promise.all(
			AUTHENTICATE_ACCOUNTS.map( async ( accountName ) => {
				const testAccount = new TestAccount( accountName );
				if ( await testAccount.hasFreshAuthCookies() ) {
					return;
				}

				const page = await browser.newPage( pwConfig.contextOptions );
				page.setDefaultTimeout( envVariables.TIMEOUT );

				await testAccount.logInViaLoginPage( page );
				await testAccount.saveAuthCookies( page.context() );

				await page.close();
			} )
		);

		await browser.close();
	}
};
