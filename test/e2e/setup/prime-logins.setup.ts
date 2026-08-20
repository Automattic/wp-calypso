import { TEST_ACCOUNT_NAMES, withDeadline } from '@automattic/calypso-e2e';
import { getAccount } from '../lib/get-account';
import { primeLoginTitle, test as setup } from '../lib/pw-base';

// Accounts logged in as before the suite starts, so the specs read cookies instead of all
// logging in at once.
//
// Every worker begins by checking the shared cookie cache in COOKIES_PATH, which the
// TeamCity checkout wipes before each build. Without this project they all miss at once and
// log in through the UI concurrently, against a calypso.live container that has just been
// created, which is where most of the CI login timeouts come from.
//
// This file declares one login per known account; which of them a run performs is the
// `accountsToPrime` of the project that depends on it. `yarn playwright test
// --project=<suite> --list` reports what the suite primes. An account no project names still
// works: getAccount falls back to logging in inline.

// Well under the 120s test timeout. A login takes about 5s, so this only trips when
// something is badly wrong, and it leaves room for the retry to still finish in time.
const PRIME_TIMEOUT = 30 * 1000;

for ( const accountName of TEST_ACCOUNT_NAMES ) {
	setup( primeLoginTitle( accountName ), async ( { page } ) => {
		try {
			// A setup project that ends with a failing test makes Playwright skip every
			// project that depends on it, which would cost the whole run instead of one
			// account's inline login.
			await withDeadline( getAccount( page, accountName, { isPriming: true } ), PRIME_TIMEOUT );
		} catch ( error ) {
			const info = setup.info();
			// Retrying is worth it, a stuck login usually succeeds second time round. Only
			// the last attempt has to pass, so the project stays green either way.
			if ( info.retry < info.project.retries ) {
				throw error;
			}
			// Annotate rather than only log: the last attempt passes, so the reports are the
			// only place a reader would otherwise see nothing at all.
			info.annotations.push( {
				type: 'prime-failed',
				description: `Could not prime login cookies for ${ accountName }: ${ error }`,
			} );
		}
	} );
}
