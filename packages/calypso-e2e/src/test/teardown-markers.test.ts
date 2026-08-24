import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, test, jest, beforeEach, afterEach } from '@jest/globals';
import nock from 'nock';
import { SecretsManager } from '../secrets';
import {
	clearAccountLeak,
	closeAccountAndRecordLeak,
	isAccountClosedError,
	reapPendingCloses,
	recordAccountLeak,
	recordPendingClose,
} from '../teardown-markers';
import type { RestAPIClient } from '../rest-api-client';
import type { Secrets } from '../secrets';

// The reap tests drive a real RestAPIClient, whose closeAccount reads secrets.
// `SecretsManager.secrets` throws when decrypted-secrets.json is absent, and the
// unit-test CI build never decrypts it.
jest.spyOn( SecretsManager, 'secrets', 'get' ).mockImplementation(
	() =>
		( {
			calypsoOauthApplication: { client_id: 'some_value', client_secret: 'some_value' },
			gmailTestEmail: 'a8c.e2e@gmail.com',
			storeSandboxCookieValue: 'sandbox_ticket',
		} ) as unknown as Secrets
);

let leakDir: string;
let pendingDir: string;

beforeEach( () => {
	leakDir = mkdtempSync( path.join( tmpdir(), 'teardown-markers-' ) );
	pendingDir = mkdtempSync( path.join( tmpdir(), 'teardown-pending-' ) );
} );

afterEach( () => {
	rmSync( leakDir, { recursive: true, force: true } );
	rmSync( pendingDir, { recursive: true, force: true } );
	nock.cleanAll();
} );

const markerFile = ( userID: number ): string => path.join( leakDir, `account-${ userID }.json` );
const emailMarkerFile = ( email: string ): string =>
	path.join( leakDir, `account-${ encodeURIComponent( email ) }.json` );

const details = {
	userID: 2001,
	username: 'e2eflowtestinginvited2001',
	email: 'e2e+2001@mailosaur.io',
};

// closeAccountAndRecordLeak only calls `closeAccount` and `getMyAccountInformation`,
// so a loose stub returning arbitrary payloads suffices. The double cast keeps the
// mocks free of the client's exact return types without using `any`.
const fakeClient = ( impl: {
	closeAccount: () => Promise< unknown >;
	getMyAccountInformation: () => Promise< unknown >;
	getBearerToken?: () => Promise< string >;
} ): RestAPIClient => impl as unknown as RestAPIClient;

describe( 'teardown-markers: record / clear', () => {
	test( 'recordAccountLeak writes a per-user marker with identity, optional blogs, and a bounded error', () => {
		recordAccountLeak( leakDir, {
			userID: 1001,
			username: 'e2eflowtestinginvited1001',
			email: 'e2e+1001@mailosaur.io',
			blogs: [ 'e2eflowtesting1001.wordpress.com' ],
			error: new Error( 'x'.repeat( 1000 ) ),
		} );

		expect( existsSync( markerFile( 1001 ) ) ).toBe( true );
		const data = JSON.parse( readFileSync( markerFile( 1001 ), 'utf8' ) );
		expect( data.userID ).toBe( 1001 );
		expect( data.username ).toBe( 'e2eflowtestinginvited1001' );
		expect( data.email ).toBe( 'e2e+1001@mailosaur.io' );
		expect( data.blogs ).toEqual( [ 'e2eflowtesting1001.wordpress.com' ] );
		expect( data.error.length ).toBeLessThanOrEqual( 300 );
	} );

	test( 'record-then-clear for the same user leaves no file (the retry-safety invariant)', () => {
		recordAccountLeak( leakDir, { userID: 1002, username: 'u', email: 'e@mailosaur.io' } );
		expect( existsSync( markerFile( 1002 ) ) ).toBe( true );

		clearAccountLeak( leakDir, 1002 );
		expect( existsSync( markerFile( 1002 ) ) ).toBe( false );
	} );

	test( 'clearAccountLeak is a safe no-op when no marker exists', () => {
		expect( () => clearAccountLeak( leakDir, 999999 ) ).not.toThrow();
	} );

	test( 'serializes a non-Error close failure as JSON, not "[object Object]"', () => {
		recordAccountLeak( leakDir, {
			userID: 1003,
			username: 'u',
			email: 'e@mailosaur.io',
			error: { success: false, code: 'has_active_subscription' },
		} );

		const data = JSON.parse( readFileSync( markerFile( 1003 ), 'utf8' ) );
		expect( data.error ).toContain( 'has_active_subscription' );
		expect( data.error ).not.toContain( '[object Object]' );
	} );

	test( 'records a marker keyed by email when the user ID is unknown', () => {
		recordAccountLeak( leakDir, {
			username: 'e2eflowtestinginvited',
			email: 'e2e+noid@mailosaur.io',
			error: 'Signup response missing user_id.',
		} );

		// Keyed by the URL-encoded email so distinct emails never collide.
		const file = path.join(
			leakDir,
			`account-${ encodeURIComponent( 'e2e+noid@mailosaur.io' ) }.json`
		);
		expect( existsSync( file ) ).toBe( true );
		const data = JSON.parse( readFileSync( file, 'utf8' ) );
		expect( data.userID ).toBeUndefined();
		expect( data.email ).toBe( 'e2e+noid@mailosaur.io' );
	} );
} );

describe( 'teardown-markers: isAccountClosedError', () => {
	test.each( [
		'invalid_token: The OAuth2 token is invalid',
		'authorization_required: An active access token must be used.',
		'Request was unauthorized',
		'user_not_found: account is gone',
		'invalid_username: no such account (rejected signup)',
	] )( 'returns true for a dead-token / auth error (%s)', ( message ) => {
		expect( isAccountClosedError( new Error( message ) ) ).toBe( true );
	} );

	test.each( [
		'500: Internal Server Error',
		'fetch failed',
		'ETIMEDOUT connecting to host',
		'Unexpected token < in JSON at position 0',
	] )( 'returns false for a transient / non-auth error (%s)', ( message ) => {
		expect( isAccountClosedError( new Error( message ) ) ).toBe( false );
	} );
} );

describe( 'closeAccountAndRecordLeak', () => {
	test( 'no userID: records an email-keyed marker without accessing the account', async () => {
		const closeAccount = jest.fn( async () => ( { success: true } ) );
		const getMyAccountInformation = jest.fn( async () => ( {} ) );
		const incompleteDetails = {
			...details,
			userID: undefined,
		} as unknown as typeof details;

		await closeAccountAndRecordLeak(
			fakeClient( { closeAccount, getMyAccountInformation } ),
			incompleteDetails,
			leakDir
		);

		expect( closeAccount ).not.toHaveBeenCalled();
		expect( getMyAccountInformation ).not.toHaveBeenCalled();
		expect( existsSync( emailMarkerFile( details.email ) ) ).toBe( true );
		const marker = JSON.parse( readFileSync( emailMarkerFile( details.email ), 'utf8' ) );
		expect( marker.error ).toContain( 'incomplete account identity' );
	} );

	test( 'neither userID nor email: skips teardown and records nothing (no recordable key)', async () => {
		const closeAccount = jest.fn( async () => ( { success: true } ) );
		const getMyAccountInformation = jest.fn( async () => ( {} ) );
		const unrecordableDetails = {
			...details,
			userID: undefined,
			email: '',
		} as unknown as typeof details;

		await closeAccountAndRecordLeak(
			fakeClient( { closeAccount, getMyAccountInformation } ),
			unrecordableDetails,
			leakDir
		);

		expect( closeAccount ).not.toHaveBeenCalled();
		expect( getMyAccountInformation ).not.toHaveBeenCalled();
		expect( readdirSync( leakDir ) ).toHaveLength( 0 );
	} );

	test( 'userID present but username/email missing: records a marker keyed by userID without accessing the account', async () => {
		const closeAccount = jest.fn( async () => ( { success: true } ) );
		const getMyAccountInformation = jest.fn( async () => ( {} ) );
		const incompleteDetails = {
			...details,
			username: '',
			email: '',
		};

		await closeAccountAndRecordLeak(
			fakeClient( { closeAccount, getMyAccountInformation } ),
			incompleteDetails,
			leakDir
		);

		expect( closeAccount ).not.toHaveBeenCalled();
		expect( getMyAccountInformation ).not.toHaveBeenCalled();
		const marker = JSON.parse( readFileSync( markerFile( details.userID ), 'utf8' ) );
		expect( marker.error ).toContain( 'incomplete account identity' );
	} );

	test( 'close succeeds: clears the marker and never probes', async () => {
		const getMyAccountInformation = jest.fn( async () => ( {} ) );
		await closeAccountAndRecordLeak(
			fakeClient( {
				closeAccount: jest.fn( async () => ( { success: true } ) ),
				getMyAccountInformation,
			} ),
			details,
			leakDir
		);

		expect( getMyAccountInformation ).not.toHaveBeenCalled();
		expect( existsSync( markerFile( details.userID ) ) ).toBe( false );
	} );

	test( 'close returns non-success and the account still exists: records a marker', async () => {
		await closeAccountAndRecordLeak(
			fakeClient( {
				closeAccount: jest.fn( async () => ( { success: false } ) ),
				getMyAccountInformation: jest.fn( async () => ( {} ) ),
			} ),
			details,
			leakDir
		);

		expect( existsSync( markerFile( details.userID ) ) ).toBe( true );
	} );

	test( 'close throws and the token is dead (probe throws auth error): no marker, account already gone', async () => {
		await closeAccountAndRecordLeak(
			fakeClient( {
				closeAccount: jest.fn( async () => {
					throw new Error( 'invalid_token: dead' );
				} ),
				getMyAccountInformation: jest.fn( async () => {
					throw new Error( 'invalid_token: dead' );
				} ),
			} ),
			details,
			leakDir
		);

		expect( existsSync( markerFile( details.userID ) ) ).toBe( false );
	} );

	test( 'close throws and probe fails transiently: records a marker (conservative, no missed leak)', async () => {
		await closeAccountAndRecordLeak(
			fakeClient( {
				closeAccount: jest.fn( async () => {
					throw new Error( '500: server error' );
				} ),
				getMyAccountInformation: jest.fn( async () => {
					throw new Error( 'fetch failed' );
				} ),
			} ),
			details,
			leakDir
		);

		expect( existsSync( markerFile( details.userID ) ) ).toBe( true );
	} );

	test( 'a stale marker is cleared once the account is confirmed gone', async () => {
		await closeAccountAndRecordLeak(
			fakeClient( {
				closeAccount: jest.fn( async () => ( { success: false } ) ),
				getMyAccountInformation: jest.fn( async () => ( {} ) ),
			} ),
			details,
			leakDir
		);
		expect( existsSync( markerFile( details.userID ) ) ).toBe( true );

		await closeAccountAndRecordLeak(
			fakeClient( {
				closeAccount: jest.fn( async () => {
					throw new Error( 'invalid_token' );
				} ),
				getMyAccountInformation: jest.fn( async () => {
					throw new Error( 'invalid_token' );
				} ),
			} ),
			details,
			leakDir
		);
		expect( existsSync( markerFile( details.userID ) ) ).toBe( false );
	} );

	describe( 'retry loops (fake timers)', () => {
		beforeEach( () => {
			jest.useFakeTimers();
		} );
		afterEach( () => {
			jest.useRealTimers();
		} );

		test( 'retries while the close is blocked by an active Atomic site, then clears once it succeeds', async () => {
			let calls = 0;
			const closeAccount = jest.fn( async () => {
				calls += 1;
				return calls < 3
					? { error: 'atomic-site', message: 'active atomic sites' }
					: { success: true };
			} );
			const promise = closeAccountAndRecordLeak(
				fakeClient( { closeAccount, getMyAccountInformation: jest.fn( async () => ( {} ) ) } ),
				details,
				leakDir
			);
			// Drive the poll waits to completion; closeAccount succeeds on the 3rd call.
			await jest.advanceTimersByTimeAsync( 90 * 1000 );
			await promise;

			expect( closeAccount ).toHaveBeenCalledTimes( 3 );
			expect( existsSync( markerFile( details.userID ) ) ).toBe( false );
		} );

		test( 'records a leak when the Atomic site never deprovisions within the retry window', async () => {
			const promise = closeAccountAndRecordLeak(
				fakeClient( {
					closeAccount: jest.fn( async () => ( {
						error: 'atomic-site',
						message: 'active atomic sites',
					} ) ),
					getMyAccountInformation: jest.fn( async () => ( {} ) ),
				} ),
				details,
				leakDir
			);
			// Advance past the full retry window so the loop reaches its deadline.
			await jest.advanceTimersByTimeAsync( 200 * 1000 );
			await promise;

			expect( existsSync( markerFile( details.userID ) ) ).toBe( true );
		} );

		test( 'retries while the close POST rejects a fresh token, then clears once it succeeds', async () => {
			let calls = 0;
			const closeAccount = jest.fn( async () => {
				calls += 1;
				return calls < 3
					? { error: 'invalid_token', message: 'The OAuth2 token is invalid.' }
					: { success: true };
			} );
			const promise = closeAccountAndRecordLeak(
				fakeClient( { closeAccount, getMyAccountInformation: jest.fn( async () => ( {} ) ) } ),
				details,
				leakDir
			);
			await jest.advanceTimersByTimeAsync( 30 * 1000 );
			await promise;

			expect( closeAccount ).toHaveBeenCalledTimes( 3 );
			expect( existsSync( markerFile( details.userID ) ) ).toBe( false );
		} );

		test( 'records a leak when the close POST still rejects the token past the retry window', async () => {
			const promise = closeAccountAndRecordLeak(
				fakeClient( {
					closeAccount: jest.fn( async () => ( {
						error: 'invalid_token',
						message: 'The OAuth2 token is invalid.',
					} ) ),
					getMyAccountInformation: jest.fn( async () => ( {} ) ),
				} ),
				details,
				leakDir
			);
			await jest.advanceTimersByTimeAsync( 60 * 1000 );
			await promise;

			expect( existsSync( markerFile( details.userID ) ) ).toBe( true );
		} );
	} );

	test( 'a thrown invalid_token error is not retried and resolves via the probe', async () => {
		const closeAccount = jest.fn( async () => {
			throw new Error( 'invalid_token: The OAuth2 token is invalid.' );
		} );
		await closeAccountAndRecordLeak(
			fakeClient( {
				closeAccount,
				getMyAccountInformation: jest.fn( async () => {
					throw new Error( 'invalid_token: The OAuth2 token is invalid.' );
				} ),
			} ),
			details,
			leakDir
		);

		expect( closeAccount ).toHaveBeenCalledTimes( 1 );
		expect( existsSync( markerFile( details.userID ) ) ).toBe( false );
	} );

	test( 'never throws even when the client throws', async () => {
		// Resolving to true means the account was accounted for: the probe could not
		// confirm it was gone, so a leak marker was written.
		await expect(
			closeAccountAndRecordLeak(
				fakeClient( {
					closeAccount: jest.fn( async () => {
						throw new Error( 'boom' );
					} ),
					getMyAccountInformation: jest.fn( async () => {
						throw new Error( 'boom' );
					} ),
				} ),
				details,
				leakDir
			)
		).resolves.toBe( true );
	} );
} );

describe( 'teardown-markers: deferred Atomic closes', () => {
	const atomicRefusal = { error: 'atomic-site', message: 'active atomic sites' };
	const pendingFile = ( userID: number ): string =>
		path.join( pendingDir, `pending-${ userID }.json` );
	// `closeAccount` refuses to act unless `/me` confirms the token belongs to the
	// very account it was asked to close, so the stub has to match on all three.
	const me = { ID: details.userID, username: details.username, email: details.email };

	/**
	 * Stubs every endpoint a reap touches: the identity precheck, the plan-cancel
	 * retry, and the close itself.
	 *
	 * @param {unknown} closeReply Body the close endpoint returns.
	 */
	function mockReapEndpoints( closeReply: unknown ) {
		nock( 'https://public-api.wordpress.com' ).persist().get( '/rest/v1.1/me' ).reply( 200, me );
		nock( 'https://public-api.wordpress.com' )
			.persist()
			.get( '/rest/v1.2/me/purchases' )
			.reply( 200, [] );
		return nock( 'https://public-api.wordpress.com' )
			.persist()
			.post( '/rest/v1.1/me/account/close' )
			.reply( 200, closeReply as nock.Body );
	}

	test( 'defers instead of waiting when the Atomic site is still deprovisioning', async () => {
		const closeAccount = jest.fn( async () => atomicRefusal );

		await closeAccountAndRecordLeak(
			fakeClient( {
				closeAccount,
				getMyAccountInformation: jest.fn( async () => ( {} ) ),
				getBearerToken: jest.fn( async () => 'token-2001' ),
			} ),
			details,
			leakDir,
			pendingDir
		);

		// One attempt, no poll: the wait now belongs to the end-of-run reaper.
		expect( closeAccount ).toHaveBeenCalledTimes( 1 );
		expect( existsSync( markerFile( details.userID ) ) ).toBe( false );

		const record = JSON.parse( readFileSync( pendingFile( details.userID ), 'utf8' ) );
		expect( record.userID ).toBe( details.userID );
		expect( record.bearerToken ).toBe( 'token-2001' );
	} );

	test( 'records a leak rather than deferring when the bearer token is unavailable', async () => {
		await closeAccountAndRecordLeak(
			fakeClient( {
				closeAccount: jest.fn( async () => atomicRefusal ),
				getMyAccountInformation: jest.fn( async () => ( {} ) ),
				getBearerToken: jest.fn( async () => {
					throw new Error( 'no token' );
				} ),
			} ),
			details,
			leakDir,
			pendingDir
		);

		expect( existsSync( pendingFile( details.userID ) ) ).toBe( false );
		expect( existsSync( markerFile( details.userID ) ) ).toBe( true );
	} );

	test( 'reap closes a deferred account and leaves no leak marker', async () => {
		recordPendingClose( pendingDir, {
			userID: details.userID,
			username: details.username,
			email: details.email,
			bearerToken: 'token-2001',
		} );

		const close = mockReapEndpoints( { success: true } );

		await reapPendingCloses( pendingDir, leakDir );

		expect( close.isDone() ).toBe( true );
		expect( existsSync( pendingFile( details.userID ) ) ).toBe( false );
		expect( existsSync( markerFile( details.userID ) ) ).toBe( false );
	} );

	test( 'reap turns an account it cannot close into a leak marker', async () => {
		recordPendingClose( pendingDir, {
			userID: details.userID,
			username: details.username,
			email: details.email,
			bearerToken: 'token-2001',
		} );
		// A non-atomic refusal ends the close loop immediately, so this covers the
		// reaper's bookkeeping without waiting out the deprovision retry window.
		mockReapEndpoints( { success: false, error: 'unknown_error' } );

		await reapPendingCloses( pendingDir, leakDir );

		// Cleared only because the leak is now reported by the marker instead; the
		// record carries a bearer token and must not outlive its evidence.
		expect( existsSync( pendingFile( details.userID ) ) ).toBe( false );
		expect( existsSync( markerFile( details.userID ) ) ).toBe( true );
	} );

	test( 'reap is a no-op when nothing was deferred', async () => {
		await expect( reapPendingCloses( pendingDir, leakDir ) ).resolves.toBeUndefined();
		expect( readdirSync( leakDir ) ).toEqual( [] );
	} );

	test( 'records a leak rather than deferring when the pending record cannot be written', async () => {
		// An unwritable pendingDir must not swallow the account: with no deferred
		// owner, the leak marker is the only remaining signal.
		rmSync( pendingDir, { recursive: true, force: true } );
		writeFileSync( pendingDir, 'not a directory' );

		await closeAccountAndRecordLeak(
			fakeClient( {
				closeAccount: jest.fn( async () => atomicRefusal ),
				getMyAccountInformation: jest.fn( async () => ( {} ) ),
				getBearerToken: jest.fn( async () => 'token-2001' ),
			} ),
			details,
			leakDir,
			pendingDir
		);

		expect( existsSync( markerFile( details.userID ) ) ).toBe( true );
	} );

	test( 'reap keeps the pending record when the leak marker cannot be written', async () => {
		recordPendingClose( pendingDir, {
			userID: details.userID,
			username: details.username,
			email: details.email,
			bearerToken: 'token-2001',
		} );
		// Losing both signals at once would leave the account invisible to CI.
		rmSync( leakDir, { recursive: true, force: true } );
		writeFileSync( leakDir, 'not a directory' );

		mockReapEndpoints( { success: false, error: 'unknown_error' } );

		await reapPendingCloses( pendingDir, leakDir );

		expect( existsSync( pendingFile( details.userID ) ) ).toBe( true );
	} );

	test( 'reap skips a malformed record instead of crashing, and leaves it for CI', async () => {
		mkdirSync( pendingDir, { recursive: true } );
		writeFileSync( path.join( pendingDir, 'pending-2001.json' ), 'null' );
		writeFileSync( path.join( pendingDir, 'pending-2002.json' ), '{"userID":2002' );

		await expect( reapPendingCloses( pendingDir, leakDir ) ).resolves.toBeUndefined();

		expect( existsSync( path.join( pendingDir, 'pending-2001.json' ) ) ).toBe( true );
		expect( existsSync( path.join( pendingDir, 'pending-2002.json' ) ) ).toBe( true );
	} );

	test( 'reap skips a record with an empty token rather than falling back to a password login', async () => {
		mkdirSync( pendingDir, { recursive: true } );
		writeFileSync(
			path.join( pendingDir, `pending-${ details.userID }.json` ),
			JSON.stringify( { ...details, bearerToken: '' } )
		);

		// No nock scopes: any HTTP attempt (notably a wp-login.php password login
		// with an empty password) would throw a disallowed-net-connect error.
		await expect( reapPendingCloses( pendingDir, leakDir ) ).resolves.toBeUndefined();
	} );
} );
