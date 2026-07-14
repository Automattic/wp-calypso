import nock from 'nock';
import { registerTwoStepAuthSecurityKeyMutation } from '../me-two-step';

const BASE = 'https://public-api.wordpress.com';
const REGISTRATION_CHALLENGE_PATH = '/rest/v1.1/me/two-step/security-key/registration_challenge';
const CANONICAL_RP_ID = 'wordpress.com';

/**
 * Regression test for a WebAuthn passkey break caused by a Multi-site
 * Dashboard (MSD) rollout change (see the E2E companion spec at
 * test/e2e/specs/authentication/authentication__passkey.spec.ts, TESTOPS-227).
 *
 * The login step never varies by host: postLoginRequest in
 * client/state/login/utils.jsx always posts to the hardcoded
 * https://wordpress.com/wp-login.php, so it always resolves to the
 * canonical `rp id = wordpress.com`. For a registered passkey to work at
 * login, registration must resolve to that same canonical host.
 *
 * registerTwoStepAuthSecurityKeyMutation only omits the `hostname` override
 * (letting the server default to the canonical rp id) when
 * `config( 'env_id' ) === 'production'`. The hosting dashboard runs under
 * `env_id: 'dashboard-production'` (see config/dashboard-production.json and
 * client/dashboard/utils/is-dashboard-env.ts) even when serving real
 * production traffic on my.wordpress.com, so that check misses it: the
 * dashboard's own hostname leaks through as the `hostname` param, and the
 * server derives a non-canonical rp id from it. That is the still-live root
 * cause described in the E2E spec above; only the rollout was reverted
 * (#112593), not this check.
 *
 * The first test below passes against trunk today. The second currently
 * FAILS against trunk: it reproduces the still-open defect directly,
 * without simulating anything. It will pass once the hostname check above
 * treats every production-tier env id (not only the literal 'production')
 * as canonical.
 */

let mockEnvId = 'production';

jest.mock( '@automattic/calypso-config', () => {
	const config = ( key: string ) => ( key === 'env_id' ? mockEnvId : undefined );
	config.isEnabled = () => false;
	return config;
} );

// navigator.credentials.create() has no jsdom implementation, and completing
// it would require a real authenticator anyway. Only the outgoing
// registration-challenge request is under test here, so the WebAuthn
// ceremony itself is stubbed out and never expected to resolve.
jest.mock( '@github/webauthn-json', () => ( {
	create: jest.fn(),
} ) );

function setHostname( hostname: string ) {
	Object.defineProperty( window, 'location', {
		writable: true,
		value: { hostname },
	} );
}

function interceptRegistrationChallenge() {
	let requestedQuery: Record< string, unknown > = {};
	const scope = nock( BASE )
		.get( REGISTRATION_CHALLENGE_PATH )
		.query( ( query ) => {
			requestedQuery = query;
			return true;
		} )
		.reply( 200, {
			rp: { id: CANONICAL_RP_ID, name: 'WordPress.com' },
			user: { id: '1', name: 'test', displayName: 'Test' },
			challenge: 'test-challenge',
			pubKeyCredParams: [],
			timeout: 60000,
		} );

	return {
		scope,
		// A hostname override (any value, including the literal string
		// "undefined" some query-string builders would produce) tells the
		// server to derive a non-canonical rp id. Only a request with no
		// `hostname` key at all defers to the server's canonical default.
		getRequestedHostname: () => requestedQuery.hostname,
	};
}

describe( 'registerTwoStepAuthSecurityKeyMutation rp id (passkey/login consistency)', () => {
	afterEach( () => {
		nock.cleanAll();
		jest.clearAllMocks();
	} );

	it( 'requests no hostname override on wordpress.com production, matching the canonical rp id login always uses', async () => {
		mockEnvId = 'production';
		setHostname( 'wordpress.com' );

		const { scope, getRequestedHostname } = interceptRegistrationChallenge();

		const mutation = registerTwoStepAuthSecurityKeyMutation();
		if ( ! mutation.mutationFn ) {
			throw new Error( 'Expected registerTwoStepAuthSecurityKeyMutation to have a mutationFn' );
		}
		// The WebAuthn ceremony is stubbed and never resolves a credential, so
		// the mutation rejects after the challenge request -- only that
		// request is under test.
		await mutation.mutationFn( 'test-key' ).catch( () => undefined );

		expect( scope.isDone() ).toBe( true );
		expect( getRequestedHostname() ).toBeUndefined();
	} );

	it( 'requests no hostname override on the hosting dashboard in production either, so a passkey works at login too', async () => {
		mockEnvId = 'dashboard-production';
		setHostname( 'my.wordpress.com' );

		const { scope, getRequestedHostname } = interceptRegistrationChallenge();

		const mutation = registerTwoStepAuthSecurityKeyMutation();
		if ( ! mutation.mutationFn ) {
			throw new Error( 'Expected registerTwoStepAuthSecurityKeyMutation to have a mutationFn' );
		}
		await mutation.mutationFn( 'test-key' ).catch( () => undefined );

		expect( scope.isDone() ).toBe( true );
		expect( getRequestedHostname() ).toBeUndefined();
	} );
} );
