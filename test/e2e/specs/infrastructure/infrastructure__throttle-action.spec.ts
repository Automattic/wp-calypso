import {
	handleActiveThrottles,
	THROTTLE_ACTION_ENV_VARS,
	throttleEnvVar,
} from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';

/**
 * The throttle policy reaches a test through a handler `pw-base` registers from
 * an auto fixture, and `handleActiveThrottles` does nothing at all when no
 * handler is registered — deliberately, so a ban met in a `beforeAll` cannot
 * take a whole describe block down with it. That leaves the wiring itself
 * unguarded: a fixture renamed, dropped, or made non-auto would have every build
 * report bans in its log and skip nothing, and no other test would notice.
 */
test.describe( 'Throttle action', { tag: [ tags.CALYPSO_PR ] }, () => {
	const expiration = throttleEnvVar( 'domain-suggestions' );
	const action = THROTTLE_ACTION_ENV_VARS[ 'domain-suggestions' ];
	const before: Record< string, string | undefined > = {};

	test.beforeEach( () => {
		before[ expiration ] = process.env[ expiration ];
		before[ action ] = process.env[ action ];

		// Failing rather than skipping: a skip cannot be caught and asserted on.
		// `test.skip()` sets the expected status before it throws, so a test that
		// swallowed it would run to the end and be reported as a failure carrying
		// no error at all.
		process.env[ expiration ] = String( Date.now() + 60_000 );
		process.env[ action ] = 'fail';
	} );

	// Left set, the fake ban would skip every later test in this worker that
	// searches for a domain, for the minute it claims to last.
	test.afterEach( () => {
		for ( const [ name, value ] of Object.entries( before ) ) {
			if ( value === undefined ) {
				delete process.env[ name ];
			} else {
				process.env[ name ] = value;
			}
		}
	} );

	test( 'The fixture registers a handler that applies the policy', async () => {
		expect( () => handleActiveThrottles( [ 'domain-suggestions' ] ) ).toThrow(
			'WordPress.com throttle active: domain-suggestions.'
		);
	} );

	// The policy runs from teardown too, so it meets tests that stopped for a
	// reason of their own. Asserted from an `afterEach` because a body stops at
	// its own skip: the hook runs after it and before the fixture teardown that
	// unregisters the handler, which is where the policy would meet it, and by
	// then the status already reads `skipped`. Under the `fail` action set above,
	// a policy that acted here would report this test as a failure rather than
	// the skip it asked for.
	test.describe( 'A test that stopped for a reason of its own', () => {
		test.afterEach( () => {
			expect( () => handleActiveThrottles( [ 'domain-suggestions' ] ) ).not.toThrow();
		} );

		test( 'keeps it', async () => {
			test.skip( true, 'A reason that is not a throttle.' );
		} );
	} );
} );
