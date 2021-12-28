import path from 'path';
import { getLaunchConfiguration } from '@automattic/calypso-e2e/dist/esm/src/browser-helper';
import { TestAccount } from '@automattic/calypso-e2e/dist/esm/src/lib/test-account';
import { chromium } from 'playwright';

export default async function globalSetup(): Promise< void > {
	const saveAuthCookies = process.env.SAVE_AUTH_COOKIES as string;
	if ( saveAuthCookies ) {
		process.env.COOKIES_PATH = path.join( __dirname, '../../', 'cookies' );

		const commonTestAccounts = [ 'simpleSitePersonalPlanUser', 'eCommerceUser', 'defaultUser' ];
		const accounts = ! [ 'true', 'false' ].includes( saveAuthCookies )
			? saveAuthCookies.split( ',' )
			: commonTestAccounts;

		const browser = await chromium.launch();
		const { userAgent } = getLaunchConfiguration( browser.version() );

		await Promise.all(
			accounts.map( async ( accountName ) => {
				const testAccount = new TestAccount( accountName );
				const browserContext = await browser.newContext( { userAgent } );
				const page = await browserContext.newPage();

				if ( await testAccount.hasFreshCookies() ) {
					return;
				}

				await testAccount.logInViaLoginPage( page );
				await testAccount.saveCookies( browserContext );
			} )
		);

		await browser.close();
	}
}
