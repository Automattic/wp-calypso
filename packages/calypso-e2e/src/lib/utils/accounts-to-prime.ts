import envVariables from '../../env-variables';
import { envToFeatureKey, getTestAccountByFeature } from './get-test-account-by-feature';
import type { TestAccountName } from '../../secrets';

/**
 * Accounts to log in as before the suite when AUTHENTICATE_ACCOUNTS says nothing, which is a
 * local run or a CI run with no test group.
 *
 * Only accounts more than one spec file logs in as are worth listing. Playwright runs a file
 * in a single worker, so an account reached from one file is never raced: priming it just
 * moves its login earlier, and when that login is broken the run pays for it twice. That is
 * why p2User and i18nUser are absent although both have an account fixture.
 */
export const DEFAULT_ACCOUNTS_TO_PRIME: TestAccountName[] = [
	'atomicUser',
	'calypsoPreReleaseUser',
	'defaultUser',
	'gutenbergSimpleSiteUser',
	'simpleSiteFreePlanUser',
	'simpleSitePersonalPlanUser',
];

/**
 * Returns the accounts to log in as before the suite starts.
 *
 * AUTHENTICATE_ACCOUNTS names the accounts a build type's group logs in as ON TOP OF the one
 * this environment resolves `accountGivenByEnvironment` to, which is always added: the
 * Gutenberg edge, nightly, CoBlocks and Atomic builds each run against a different one, and
 * it is the busiest account of those runs. It comes from a static table, so resolving it here
 * costs nothing. A group that needs no other account sets the variable to an empty value.
 *
 * Reading the environment rather than taking it as an argument keeps this callable from
 * outside a Playwright run: `test/e2e/bin/primed-accounts.js` reports what each TeamCity
 * build type primes by setting the same variables.
 */
export function getAccountNamesToPrime(): TestAccountName[] {
	let accountNames = DEFAULT_ACCOUNTS_TO_PRIME;

	// Read process.env rather than the envVariables getter: the getter returns an empty array
	// both when the variable is unset and when it is set to an empty value, and those mean
	// different things here.
	if ( process.env.AUTHENTICATE_ACCOUNTS !== undefined ) {
		try {
			accountNames = envVariables.AUTHENTICATE_ACCOUNTS;
		} catch ( error ) {
			// An unknown account name throws, and it throws for the whole list rather than the
			// one bad entry. This runs while a spec file is being collected, so letting it
			// escape would fail the run before a single test starts. Fall back to the account
			// this environment resolves to, appended below, and nothing else: the default list
			// is Simple site accounts, which on an Atomic or Jetpack build would be logins no
			// spec uses while the ones it does use stay unprimed.
			console.warn( `Ignoring AUTHENTICATE_ACCOUNTS: ${ error }` );
			accountNames = [];
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
