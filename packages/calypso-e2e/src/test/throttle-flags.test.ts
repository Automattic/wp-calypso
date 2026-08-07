import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import * as teamcity from '../lib/teamcity';
import {
	detectThrottle,
	flushRaisedFlags,
	formatFlagTag,
	mergeFlags,
	parseBanDurationMs,
	parseFlagTag,
	raiseFlag,
	readActiveSlugs,
	readLocalActiveSlugs,
} from '../lib/throttle-flags';

let dir: string;
let tagOwnBuild: jest.SpiedFunction< typeof teamcity.tagOwnBuild >;
let fetchProjectBuildTags: jest.SpiedFunction< typeof teamcity.fetchProjectBuildTags >;

beforeEach( () => {
	dir = mkdtempSync( path.join( tmpdir(), 'throttle-flags-' ) );
	process.env.E2E_THROTTLE_FLAGS_DIR = dir;
	jest.spyOn( Date, 'now' ).mockReturnValue( 1_000 );
	tagOwnBuild = jest.spyOn( teamcity, 'tagOwnBuild' ).mockResolvedValue( 200 );
	fetchProjectBuildTags = jest.spyOn( teamcity, 'fetchProjectBuildTags' ).mockResolvedValue( null );
} );

afterEach( () => {
	jest.restoreAllMocks();
	delete process.env.E2E_THROTTLE_FLAGS_DIR;
	rmSync( dir, { recursive: true, force: true } );
} );

describe( 'raiseFlag', () => {
	test( 'writes the flag atomically and tags the build', async () => {
		await raiseFlag( 'signup', 600_000 );

		const file = path.join( dir, `${ process.pid }.json` );
		expect( JSON.parse( readFileSync( file, 'utf8' ) )[ 0 ] ).toEqual( {
			id: 'signup',
			raisedAtMs: 1_000,
			durationMs: 600_000,
			expiresAtMs: 601_000,
		} );
		expect( readdirSync( dir ).some( ( name ) => name.endsWith( '.tmp' ) ) ).toBe( false );
		expect( tagOwnBuild ).toHaveBeenCalledWith( 'throttle-signup-601000' );
	} );

	test( 'falls back to the documented ban length when none is given', async () => {
		await raiseFlag( 'signup' );

		expect( tagOwnBuild ).toHaveBeenCalledWith( 'throttle-signup-3601000' );
	} );

	test( 'does not extend or re-tag a flag already active in this process', async () => {
		await raiseFlag( 'signup', 600_000 );
		jest.spyOn( Date, 'now' ).mockReturnValue( 2_000 );
		await raiseFlag( 'signup', 600_000 );

		const file = path.join( dir, `${ process.pid }.json` );
		expect( JSON.parse( readFileSync( file, 'utf8' ) )[ 0 ].expiresAtMs ).toBe( 601_000 );
		expect( tagOwnBuild ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'a failed tag never reaches the test, before or during the flush', async () => {
		tagOwnBuild.mockRejectedValue( new Error( 'TeamCity is down' ) );

		await expect( raiseFlag( 'signup' ) ).resolves.toBeUndefined();
		await expect( flushRaisedFlags() ).resolves.toBeUndefined();
		// The local record still landed: only the tag was lost.
		expect( readLocalActiveSlugs().has( 'signup' ) ).toBe( true );
	} );

	test( 'flushing with nothing raised is a no-op', async () => {
		await expect( flushRaisedFlags() ).resolves.toBeUndefined();
	} );

	test( 'an unwritable directory is reported, never thrown', async () => {
		process.env.E2E_THROTTLE_FLAGS_DIR = path.join( dir, 'a-file', 'nested' );
		writeFileSync( path.join( dir, 'a-file' ), 'not a directory' );
		const warn = jest.spyOn( console, 'warn' ).mockImplementation( () => undefined );

		await expect( raiseFlag( 'signup' ) ).resolves.toBeUndefined();
		expect( warn ).toHaveBeenCalled();
		expect( tagOwnBuild ).not.toHaveBeenCalled();
	} );
} );

describe( 'reading', () => {
	test( 'local slugs come from every worker file and drop the expired', () => {
		writeFileSync(
			path.join( dir, 'worker-a.json' ),
			JSON.stringify( [
				{ id: 'signup', raisedAtMs: 0, durationMs: 5_000, expiresAtMs: 5_000 },
				{ id: 'domain-availability', raisedAtMs: 0, durationMs: 500, expiresAtMs: 500 },
			] )
		);
		writeFileSync(
			path.join( dir, 'worker-b.json' ),
			JSON.stringify( [
				{ id: 'domain-suggestions', raisedAtMs: 0, durationMs: 5_000, expiresAtMs: 5_000 },
			] )
		);

		expect( [ ...readLocalActiveSlugs() ].sort() ).toEqual( [ 'domain-suggestions', 'signup' ] );
	} );

	test( 'active slugs merge local files with the project tags', async () => {
		writeFileSync(
			path.join( dir, 'worker-a.json' ),
			JSON.stringify( [ { id: 'signup', raisedAtMs: 0, durationMs: 5_000, expiresAtMs: 5_000 } ] )
		);
		fetchProjectBuildTags.mockResolvedValue( [
			'throttle-domain-suggestions-9000',
			'throttle-domain-availability-500',
			'wpcom-block-editor-release-build',
			'throttle-probe-testproc-18849000',
		] );

		expect( [ ...( await readActiveSlugs() ) ].sort() ).toEqual( [
			'domain-suggestions',
			'signup',
		] );
	} );

	test( 'an unreadable project leaves the local view standing', async () => {
		writeFileSync(
			path.join( dir, 'worker-a.json' ),
			JSON.stringify( [ { id: 'signup', raisedAtMs: 0, durationMs: 5_000, expiresAtMs: 5_000 } ] )
		);
		fetchProjectBuildTags.mockResolvedValue( null );

		expect( [ ...( await readActiveSlugs() ) ] ).toEqual( [ 'signup' ] );
	} );

	test( 'no flags anywhere means nothing is throttled', async () => {
		rmSync( dir, { recursive: true, force: true } );

		expect( readLocalActiveSlugs().size ).toBe( 0 );
		expect( ( await readActiveSlugs() ).size ).toBe( 0 );
	} );
} );

describe( 'tags', () => {
	test( 'round-trips a flag', () => {
		const flag = {
			id: 'signup' as const,
			raisedAtMs: 0,
			durationMs: 3_600_000,
			expiresAtMs: 9_000,
		};
		expect( formatFlagTag( flag ) ).toBe( 'throttle-signup-9000' );
		expect( parseFlagTag( 'throttle-signup-9000' ) ).toMatchObject( {
			id: 'signup',
			expiresAtMs: 9_000,
		} );
	} );

	test( 'ignores tags that only look like ours', () => {
		expect( parseFlagTag( 'throttle-probe-testproc-18849000' ) ).toBeNull();
		expect( parseFlagTag( 'throttle-signup' ) ).toBeNull();
		expect( parseFlagTag( 'throttle-unknown-slug-9000' ) ).toBeNull();
		expect( parseFlagTag( 'throttle-signup-later' ) ).toBeNull();
		expect( parseFlagTag( 'x-throttle-signup-9000' ) ).toBeNull();
	} );
} );

describe( 'mergeFlags', () => {
	test( 'keeps the maximum active expiry per slug', () => {
		expect(
			mergeFlags( [
				{ id: 'signup', raisedAtMs: 0, durationMs: 2_000, expiresAtMs: 2_000 },
				{ id: 'signup', raisedAtMs: 0, durationMs: 4_000, expiresAtMs: 4_000 },
				{ id: 'domain-suggestions', raisedAtMs: 0, durationMs: 500, expiresAtMs: 500 },
			] )
		).toEqual( [ { id: 'signup', raisedAtMs: 0, durationMs: 4_000, expiresAtMs: 4_000 } ] );
	} );
} );

describe( 'detectThrottle', () => {
	test( 'reads the ban length wpcom states', () => {
		expect(
			parseBanDurationMs(
				'Limit reached. You can try again in 10 minutes. Trying again before that will only increase the time you have to wait.'
			)
		).toBe( 600_000 );
		expect( parseBanDurationMs( 'Limit reached.' ) ).toBeNull();
	} );

	test.each( [
		[
			{ error: 'throttled', message: 'Limit reached. You can try again in 10 minutes.' },
			{ id: 'signup', durationMs: 600_000 },
		],
		[ { error: 'throttled' }, { id: 'signup', durationMs: 3_600_000 } ],
		[
			{ error: 'domain_suggestions_throttled', message: 'You can try again in 1 minute.' },
			{ id: 'domain-suggestions', durationMs: 60_000 },
		],
		[
			{ error: 'domain_availability_throttle', message: 'Limit reached.' },
			{ id: 'domain-availability', durationMs: 60_000 },
		],
		[
			{ url: '/domains/example/is-available', status: 429, body: 'Limit reached.' },
			{ id: 'domain-availability', durationMs: 60_000 },
		],
	] )( 'maps %#', ( value, expected ) => {
		expect( detectThrottle( value ) ).toEqual( expected );
	} );

	test( 'an ordinary response is not a throttle', () => {
		expect( detectThrottle( { success: true } ) ).toBeNull();
		expect( detectThrottle( new Error( 'network down' ) ) ).toBeNull();
	} );
} );
