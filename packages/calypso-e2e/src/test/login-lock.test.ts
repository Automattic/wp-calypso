import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, describe, expect, test } from '@jest/globals';
import { clearStaleLoginLocks, withLoginLock } from '../lib/login-lock';

const cookiesPath = mkdtempSync( path.join( tmpdir(), 'login-lock-' ) );
process.env.COOKIES_PATH = cookiesPath;

afterAll( () => {
	delete process.env.COOKIES_PATH;
	rmSync( cookiesPath, { recursive: true, force: true } );
} );

describe( 'withLoginLock', () => {
	test( 'serialises concurrent calls for the same account', async () => {
		const markers: string[] = [];
		const run = () =>
			withLoginLock( 'defaultUser', async () => {
				markers.push( 'enter' );
				await new Promise( ( resolve ) => setTimeout( resolve, 10 ) );
				markers.push( 'exit' );
			} );

		await Promise.all( [ run(), run() ] );

		expect( markers ).toEqual( [ 'enter', 'exit', 'enter', 'exit' ] );
	} );

	test( 'does not block different accounts', async () => {
		// Keyed by anything but the account, this would deadlock and time the test out.
		await expect(
			withLoginLock( 'defaultUser', () => withLoginLock( 'otherUser', async () => 'acquired' ) )
		).resolves.toBe( 'acquired' );
	} );

	test( 'releases the lock after the callback throws', async () => {
		await expect(
			withLoginLock( 'defaultUser', async () => {
				throw new Error( 'login failed' );
			} )
		).rejects.toThrow( 'login failed' );

		await expect( withLoginLock( 'defaultUser', async () => 'acquired' ) ).resolves.toBe(
			'acquired'
		);
	} );
} );

describe( 'clearStaleLoginLocks', () => {
	test( 'removes leftover locks and leaves the cookie files alone', () => {
		const leftover = path.join( cookiesPath, 'defaultUser.lock' );
		const cookies = path.join( cookiesPath, 'defaultUser.json' );
		mkdirSync( leftover );
		writeFileSync( cookies, '{}' );

		clearStaleLoginLocks();

		expect( existsSync( leftover ) ).toBe( false );
		expect( existsSync( cookies ) ).toBe( true );
	} );
} );
