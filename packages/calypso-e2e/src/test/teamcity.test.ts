import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import {
	fetchBuildLog,
	fetchBuildsByTag,
	parseBuildDate,
	readProperty,
	tagOwnBuild,
} from '../lib/teamcity';

const PASSWORD = 'sUp3r-s3cr3t-t0k3n';

let dir: string;

/**
 * Writes a properties file and points the environment at it.
 */
function writeProperties( contents: string ): string {
	const file = path.join( dir, 'teamcity.build.parameters' );
	writeFileSync( file, contents );
	process.env.TEAMCITY_BUILD_PROPERTIES_FILE = file;
	return file;
}

/**
 * A properties file with every key the module needs, escaped as TeamCity writes it.
 */
function completeProperties(): string {
	return [
		'teamcity.serverUrl=https\\://teamcity.example.com',
		'teamcity.build.id=18847887',
		'teamcity.auth.userId=TeamCityBuildId\\=18847887',
		`teamcity.auth.password=${ PASSWORD }`,
	].join( '\n' );
}

beforeEach( () => {
	dir = mkdtempSync( path.join( tmpdir(), 'teamcity-props-' ) );
	delete process.env.TEAMCITY_BUILD_PROPERTIES_FILE;
} );

afterEach( () => {
	jest.restoreAllMocks();
	delete process.env.TEAMCITY_BUILD_PROPERTIES_FILE;
	rmSync( dir, { recursive: true, force: true } );
} );

describe( 'readProperty', () => {
	test( 'unescapes what java.util.Properties.store() escapes in a value', () => {
		const contents = [
			'teamcity.auth.userId=TeamCityBuildId\\=18847887',
			'teamcity.serverUrl=https\\://teamcity.example.com',
			'a.windows.path=C\\:\\\\builds\\\\agent',
			'a.unicode.value=caf\\u00e9',
			'a.tab.value=one\\ttwo',
		].join( '\n' );

		expect( readProperty( contents, 'teamcity.auth.userId' ) ).toBe( 'TeamCityBuildId=18847887' );
		expect( readProperty( contents, 'teamcity.serverUrl' ) ).toBe( 'https://teamcity.example.com' );
		expect( readProperty( contents, 'a.windows.path' ) ).toBe( 'C:\\builds\\agent' );
		expect( readProperty( contents, 'a.unicode.value' ) ).toBe( 'café' );
		expect( readProperty( contents, 'a.tab.value' ) ).toBe( 'one\ttwo' );
		expect( readProperty( contents, 'absent.key' ) ).toBeNull();
	} );

	test( 'does not treat the key as a regular expression', () => {
		expect( readProperty( 'axbxc=matched\n', 'a.b.c' ) ).toBeNull();
	} );
} );

describe( 'fail-open', () => {
	test( 'no properties file: reports nothing, tags nothing, never throws', async () => {
		const fetchSpy = jest.spyOn( globalThis, 'fetch' );

		await expect( tagOwnBuild( 'throttle-signup' ) ).resolves.toBeNull();
		expect( fetchSpy ).not.toHaveBeenCalled();
	} );

	test( 'properties file missing keys: no request, and the caller is told', async () => {
		writeProperties( 'teamcity.build.id=18847887\n' );
		const fetchSpy = jest.spyOn( globalThis, 'fetch' );

		// An agent whose properties name no credentials must not read like a
		// laptop: every lookup it makes would otherwise pass for a quiet day.
		await expect( tagOwnBuild( 'throttle-signup' ) ).rejects.toThrow(
			'The TeamCity build properties file carries no credentials.'
		);
		expect( fetchSpy ).not.toHaveBeenCalled();
	} );

	test( 'unreadable properties file: no request, and the caller is told', async () => {
		process.env.TEAMCITY_BUILD_PROPERTIES_FILE = path.join( dir, 'does-not-exist' );
		const fetchSpy = jest.spyOn( globalThis, 'fetch' );

		// Unlike a local run, this build may be taggable a moment later.
		await expect( tagOwnBuild( 'throttle-signup' ) ).rejects.toThrow(
			'The TeamCity build properties file could not be read.'
		);
		expect( fetchSpy ).not.toHaveBeenCalled();
	} );
} );

describe( 'fetchBuildsByTag', () => {
	test( 'reads the finish dates TeamCity renders, and takes a running build as unfinished', async () => {
		writeProperties( completeProperties() );
		jest.spyOn( globalThis, 'fetch' ).mockResolvedValue(
			Response.json( {
				build: [
					{ id: 11, finishDate: '20260810T124500+0000' },
					{ id: 22, finishDate: '20260810T144500+0200' },
					{ id: 33 },
				],
			} )
		);

		await expect( fetchBuildsByTag( 'throttle-signup', { sinceMs: 0 } ) ).resolves.toEqual( [
			{ id: 11, finishedAtMs: Date.parse( '2026-08-10T12:45:00Z' ) },
			{ id: 22, finishedAtMs: Date.parse( '2026-08-10T12:45:00Z' ) },
			{ id: 33, finishedAtMs: null },
		] );
	} );

	test( 'a refused lookup is reported, not read as no throttle', async () => {
		writeProperties( completeProperties() );
		jest
			.spyOn( globalThis, 'fetch' )
			.mockResolvedValue( new Response( 'Access denied', { status: 403 } ) );

		// A credential that may not query other builds must not look like a quiet day.
		await expect( fetchBuildsByTag( 'throttle-signup', { sinceMs: 0 } ) ).rejects.toThrow( '403' );
	} );

	test( 'no TeamCity build around it is nothing to ask, not a failure', async () => {
		await expect( fetchBuildsByTag( 'throttle-signup', { sinceMs: 0 } ) ).resolves.toBeNull();
	} );

	test( 'a refused log read is reported, not read as an empty log', async () => {
		writeProperties( completeProperties() );
		jest
			.spyOn( globalThis, 'fetch' )
			.mockResolvedValue( new Response( 'Access denied', { status: 401 } ) );

		await expect( fetchBuildLog( 11 ) ).rejects.toThrow( '401' );
	} );

	test( 'anything but a date is no date at all', () => {
		expect( parseBuildDate( undefined ) ).toBeNull();
		expect( parseBuildDate( 'running' ) ).toBeNull();
	} );
} );

describe( 'tagOwnBuild', () => {
	test( 'sends the token in the Authorization header, never in the URL', async () => {
		writeProperties( completeProperties() );
		const fetchSpy = jest
			.spyOn( globalThis, 'fetch' )
			.mockResolvedValue( new Response( '', { status: 200 } ) );

		await expect( tagOwnBuild( 'throttle-signup-123' ) ).resolves.toBe( 200 );

		const [ url, init ] = fetchSpy.mock.calls[ 0 ] as [ string, RequestInit ];
		expect( url ).toBe( 'https://teamcity.example.com/app/rest/builds/id:18847887/tags' );
		expect( url ).not.toContain( PASSWORD );
		expect( url ).not.toContain( '@' );
		expect( init.body ).toBe( 'throttle-signup-123' );

		const authorization = ( init.headers as Record< string, string > ).Authorization;
		expect( authorization ).toBe(
			`Basic ${ Buffer.from( `TeamCityBuildId=18847887:${ PASSWORD }` ).toString( 'base64' ) }`
		);
	} );

	test( 'a failing request logs nothing, so no derived credential can leak', async () => {
		writeProperties( completeProperties() );
		const encoded = Buffer.from( `TeamCityBuildId=18847887:${ PASSWORD }` ).toString( 'base64' );
		// A rejection carrying both the raw and the derived credential: TeamCity
		// masks neither in a log line written by us.
		jest
			.spyOn( globalThis, 'fetch' )
			.mockRejectedValue( new Error( `connect ECONNREFUSED (basic ${ encoded }, ${ PASSWORD })` ) );

		const consoleSpies = ( [ 'log', 'warn', 'error', 'info', 'debug' ] as const ).map( ( method ) =>
			jest.spyOn( console, method ).mockImplementation( () => undefined )
		);

		await expect( tagOwnBuild( 'throttle-signup-123' ) ).rejects.toThrow(
			'The TeamCity tag request failed.'
		);

		for ( const spy of consoleSpies ) {
			expect( spy ).not.toHaveBeenCalled();
		}
	} );

	test( 'a request that never settles is abandoned, not left hanging', async () => {
		writeProperties( completeProperties() );
		// What the deadline does to it, without waiting out the deadline.
		const fetchSpy = jest
			.spyOn( globalThis, 'fetch' )
			.mockRejectedValue( new Error( 'The operation was aborted due to timeout' ) );

		await expect( tagOwnBuild( 'throttle-signup-123' ) ).rejects.toThrow(
			'The TeamCity tag request failed.'
		);
		// The deadline is the caller's, not the request's: nothing else stops it.
		expect( ( fetchSpy.mock.calls[ 0 ][ 1 ] as RequestInit ).signal ).toBeDefined();
	} );

	test( 'a non-200 response is reported as a status, not thrown', async () => {
		writeProperties( completeProperties() );
		jest
			.spyOn( globalThis, 'fetch' )
			.mockResolvedValue( new Response( 'Access denied', { status: 403 } ) );

		await expect( tagOwnBuild( 'throttle-signup-123' ) ).resolves.toBe( 403 );
	} );
} );
