/* eslint-disable require-jsdoc */
import { chromium } from 'playwright';
import envVariables from '../env-variables';
import { TestAccount } from '../lib/test-account';
import pwConfig from './playwright-config';

export default async (): Promise< void > => {
	const { AUTHENTICATE_ACCOUNTS } = envVariables;

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

				await testAccount.logInViaLoginPage( page );
				await testAccount.saveAuthCookies( page.context() );

				await page.close();
			} )
		);

		await browser.close();
	}
};
