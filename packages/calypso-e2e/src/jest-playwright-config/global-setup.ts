/* eslint-disable require-jsdoc */
import { Browser, chromium } from 'playwright';
import envVariables from '../env-variables';
import { TestAccount } from '../lib/test-account';
import pwConfig from './playwright-config';

export default async (): Promise< void > => {
	const { AUTHENTICATE_ACCOUNTS, CALYPSO_BASE_URL } = envVariables;

	try {
		const response = await fetch( CALYPSO_BASE_URL, {
			method: 'HEAD',
			signal: AbortSignal.timeout( 5000 ),
		} );
		if ( ! response.ok ) {
			throw new Error( `Server responded with status ${ response.status }` );
		}
	} catch ( e ) {
		console.error( `Failed to ping a Calypso server running at ${ CALYPSO_BASE_URL }` );
		if ( e instanceof Error ) {
			console.error( `Error: ${ e.message }` );
		}
		console.error( 'Either:' );
		console.error( '  make sure the Calypso development server is running with: `yarn start`, or' );
		console.error( '  set the CALYPSO_BASE_URL environment variable to the appropriate value.' );
		console.error( 'Refer to the documentation in `test/e2e/docs/environment_variables.md`.' );
		process.exit( 1 );
	}

	// If PWDEBUG mode is enabled (stepping through each step)
	// don't execute the cookie refresh.
	if ( process.env.PWDEBUG ) {
		return;
	}

	// If the list of accounts for which to pre-authenticate and save cookies
	// for is empty, then don't run.
	if ( AUTHENTICATE_ACCOUNTS.length === 0 ) {
		return;
	}

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

			await loginAndSaveCookiesWithRetry( testAccount, browser );
		} )
	);

	await browser.close();
};

async function loginAndSaveCookiesWithRetry( testAccount: TestAccount, browser: Browser ) {
	const MAX_ATTEMPTS = 2;
	let numberOfAttempts = 0;

	let error: Error | undefined;
	while ( numberOfAttempts < MAX_ATTEMPTS ) {
		try {
			return await loginAndSaveCookies( testAccount, browser );
		} catch ( err ) {
			numberOfAttempts++;
			error = err as Error;
		}
	}

	throw error;
}

async function loginAndSaveCookies( testAccount: TestAccount, browser: Browser ) {
	const page = await browser.newPage( pwConfig.contextOptions );
	page.setDefaultTimeout( envVariables.TIMEOUT );
	try {
		await testAccount.logInViaLoginPage( page );
		await testAccount.saveAuthCookies( page.context() );
	} finally {
		await page.close();
	}
}
