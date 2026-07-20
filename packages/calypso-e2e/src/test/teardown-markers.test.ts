import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, test, jest, beforeEach, afterEach } from '@jest/globals';
import {
	clearAccountLeak,
	closeAccountAndRecordLeak,
	isAccountClosedError,
	recordAccountLeak,
} from '../teardown-markers';
import type { RestAPIClient } from '../rest-api-client';

let leakDir: string;

beforeEach( () => {
	leakDir = mkdtempSync( path.join( tmpdir(), 'teardown-markers-' ) );
} );

afterEach( () => {
	rmSync( leakDir, { recursive: true, force: true } );
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

	test( 'retries while the close is blocked by an active Atomic site, then clears once it succeeds', async () => {
		jest.useFakeTimers();
		try {
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
		} finally {
			jest.useRealTimers();
		}
	} );

	test( 'records a leak when the Atomic site never deprovisions within the retry window', async () => {
		jest.useFakeTimers();
		try {
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
		} finally {
			jest.useRealTimers();
		}
	} );

	test( 'never throws even when the client throws', async () => {
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
		).resolves.toBeUndefined();
	} );
} );
