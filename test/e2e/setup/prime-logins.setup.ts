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
// The account fixtures own this list, so adding a fixture primes it. An account missing from
// it still works: getAccount falls back to logging in inline, which is what every account did
// before this project existed.
const defaultAccountNames: TestAccountName[] = [
	...Object.values( fixtureAccounts ),
	// Not a fixture, but the account many specs select through a criteria override.
	'simpleSitePersonalPlanUser',
];

/**
 * Returns the accounts to log in as before the suite starts.
 *
 * A build type that runs a narrow group can list just the accounts it needs in
 * AUTHENTICATE_ACCOUNTS, or opt out of priming altogether by setting it to an empty value;
 * the ToS build does the latter. Anything else gets the default list above plus whichever
 * account this environment resolves `accountGivenByEnvironment` to, since the Gutenberg
 * edge, nightly and Atomic builds each run against a different one and it is the busiest
 * account of those runs.
 */
function getAccountNamesToPrime(): TestAccountName[] {
	// Read process.env rather than the envVariables getter: the getter returns an empty array
	// both when the variable is unset and when it is set to an empty value, and those mean
	// different things here.
	if ( process.env.AUTHENTICATE_ACCOUNTS !== undefined ) {
		try {
			return envVariables.AUTHENTICATE_ACCOUNTS;
		} catch ( error ) {
			// An unknown account name throws. This runs while the file is being collected, so
			// letting it escape would fail the run before a single spec starts.
			console.warn( `Ignoring AUTHENTICATE_ACCOUNTS: ${ error }` );
		}
	}

	const accountNames = [ ...defaultAccountNames ];
	try {
		accountNames.push( getTestAccountByFeature( envToFeatureKey( envVariables ) ) );
	} catch {
		// No account is mapped to this environment; whatever needs one logs in inline.
	}
	return accountNames;
}

// Well under the 120s test timeout. A login takes about 5s, so this only trips when
// something is badly wrong, and it leaves room for the retry to still finish in time.
const PRIME_TIMEOUT = 30 * 1000;

for ( const accountName of new Set( getAccountNamesToPrime() ) ) {
	setup( `prime login cookies: ${ accountName }`, async ( { page } ) => {
		let timer: NodeJS.Timeout | undefined;
		try {
			// Race our own deadline: Playwright's test timeout aborts from the outside and
			// can't be caught here, and a setup project that ends with a failing test makes
			// Playwright skip every project that depends on it. That would cost the whole
			// run instead of one account's inline login.
			await Promise.race( [
				getAccount( page, accountName, { isPriming: true } ),
				new Promise( ( _resolve, reject ) => {
					timer = setTimeout(
						() => reject( new Error( `timed out after ${ PRIME_TIMEOUT }ms` ) ),
						PRIME_TIMEOUT
					);
				} ),
			] );
		} catch ( error ) {
			const { retry, project } = setup.info();
			// Retrying is worth it, a stuck login usually succeeds second time round. Only
			// the last attempt has to pass, so the project stays green either way.
			if ( retry < project.retries ) {
				throw error;
			}
			console.warn( `Could not prime login cookies for ${ accountName }: ${ error }` );
		} finally {
			clearTimeout( timer );
		}
	} );
}
