import { getAccountNamesToPrime } from '@automattic/calypso-e2e';
import { getAccount } from '../lib/get-account';
import { test as setup } from '../lib/pw-base';
import { withDeadline } from '../lib/with-deadline';

// Accounts logged in as before the suite starts, so the specs read cookies instead of all
// logging in at once.
//
// Every worker begins by checking the shared cookie cache in COOKIES_PATH, which the
// TeamCity checkout wipes before each build. Without this project they all miss at once and
// log in through the UI concurrently, against a calypso.live container that has just been
// created, which is where most of the CI login timeouts come from.
//
// Which accounts those are comes from AUTHENTICATE_ACCOUNTS and the run's own environment;
// getAccountNamesToPrime owns that, so `test/e2e/bin/primed-accounts.js` can report what
// each build type primes without starting a build. An account it leaves out still works:
// getAccount falls back to logging in inline, which is what every account did before this
// project existed.

// Well under the 120s test timeout. A login takes about 5s, so this only trips when
// something is badly wrong, and it leaves room for the retry to still finish in time.
const PRIME_TIMEOUT = 30 * 1000;

const accountNamesToPrime = getAccountNamesToPrime();

// The tests below report each account separately. Name the whole list once as well, so a
// build log answers what this build type asked for without reading its TeamCity parameters.
console.log(
	`Priming login cookies for: ${ accountNamesToPrime.join( ', ' ) || '(no accounts)' }`
);

for ( const accountName of accountNamesToPrime ) {
	setup( `prime login cookies: ${ accountName }`, async ( { page } ) => {
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
