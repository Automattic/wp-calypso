import path from 'path';
import { TestAccount } from '@automattic/calypso-e2e/dist/esm/src/lib/test-account';

export default async function globalSetup(): Promise< void > {
	const saveAuthCookies = process.env.SAVE_AUTH_COOKIES as string;
	if ( saveAuthCookies ) {
		process.env.COOKIES_PATH = path.join( __dirname, '../../', 'cookies' );

		const commonTestAccounts = [ 'simpleSitePersonalPlanUser', 'eCommerceUser', 'defaultUser' ];
		const accounts = ! [ 'true', 'false' ].includes( saveAuthCookies )
			? saveAuthCookies.split( ',' )
			: commonTestAccounts;

		await Promise.all(
			accounts.map( ( accountName ) => {
				const account = new TestAccount( accountName );
				return account.logInAndSaveAuthCookies();
			} )
		);
	}
}
