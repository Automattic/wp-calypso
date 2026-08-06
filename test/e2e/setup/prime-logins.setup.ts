import {
	envToFeatureKey,
	envVariables,
	getTestAccountByFeature,
	type TestAccountName,
} from '@automattic/calypso-e2e';
import { getAccount } from '../lib/get-account';
import { fixtureAccounts, test as setup } from '../lib/pw-base';

// Accounts logged in as before the suite starts, so the specs read cookies instead of all
// logging in at once.
//
// Every worker begins by checking the shared cookie cache in COOKIES_PATH, which the
// TeamCity checkout wipes before each build. Without this project they all miss at once and
// log in through the UI concurrently, against a calypso.live container that has just been
// created, which is where most of the CI login timeouts come from.
//
// Every CI build type names the accounts its group logs in as, so this list only applies to
// a local run and to a CI run with no test group. An account missing from it still works:
// getAccount falls back to logging in inline, which is what every account did before this
// project existed.
//
// Only accounts more than one spec file logs in as are worth listing. Playwright runs a file
// in a single worker, so an account reached from one file is never raced: priming it just
// moves its login earlier, and when that login is broken the build pays for it twice.
const singleSpecAccounts: TestAccountName[] = [ 'p2User', 'i18nUser' ];
const defaultAccountNames: TestAccountName[] = [
	...Object.values( fixtureAccounts ).filter( ( name ) => ! singleSpecAccounts.includes( name ) ),
	// Not a fixture, but the account many specs select through a criteria override.
	'simpleSitePersonalPlanUser',
];

/**
 * Returns the accounts to log in as before the suite starts.
 *
 * AUTHENTICATE_ACCOUNTS names the accounts a build type's group logs in as ON TOP OF the
 * one this environment resolves `accountGivenByEnvironment` to, which is always added: the
 * Gutenberg edge, nightly, CoBlocks and Atomic builds each run against a different one, and
 * it is the busiest account of those runs. It comes from a static table, so resolving it
 * here costs nothing. A group that needs no other account sets the variable to an empty
 * value.
 */
function getAccountNamesToPrime(): TestAccountName[] {
	let accountNames = defaultAccountNames;

	// Read process.env rather than the envVariables getter: the getter returns an empty array
	// both when the variable is unset and when it is set to an empty value, and those mean
	// different things here.
	if ( process.env.AUTHENTICATE_ACCOUNTS !== undefined ) {
		try {
			accountNames = envVariables.AUTHENTICATE_ACCOUNTS;
		} catch ( error ) {
			// An unknown account name throws, and it throws for the whole list rather than the
			// one bad entry. This runs while the file is being collected, so letting it escape
			// would fail the run before a single spec starts. Priming more than the build needs
			// costs a few logins; priming less costs the concurrent logins this project exists
			// to prevent, so fall back to the full list.
			console.warn( `Ignoring AUTHENTICATE_ACCOUNTS: ${ error }` );
			accountNames = defaultAccountNames;
		}
	}

	try {
		accountNames = [ ...accountNames, getTestAccountByFeature( envToFeatureKey( envVariables ) ) ];
	} catch {
		// No account is mapped to this environment; whatever needs one logs in inline.
	}

	// Naming the account this environment resolves to is one login, not two: a build type
	// lists it when the specs use it directly, and the append above covers it either way.
	return [ ...new Set( accountNames ) ];
}

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
		let timer: NodeJS.Timeout | undefined;
		try {
			// Race our own deadline: Playwright's test timeout aborts from the outside and
			// can't be caught here, and a setup project that ends with a failing test makes
			// Playwright skip every project that depends on it. That would cost the whole
			// run instead of one account's inline login.
			const priming = getAccount( page, accountName, { isPriming: true } );
			// When the deadline wins, the login keeps running until teardown closes the page
			// and then rejects. Playwright charges an unhandled rejection to the test, which
			// is the failure the deadline exists to avoid, so keep a handler on it.
			priming.catch( () => {} );
			await Promise.race( [
				priming,
				new Promise( ( _resolve, reject ) => {
					timer = setTimeout(
						() => reject( new Error( `timed out after ${ PRIME_TIMEOUT }ms` ) ),
						PRIME_TIMEOUT
					);
				} ),
			] );
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
		} finally {
			clearTimeout( timer );
		}
	} );
}
