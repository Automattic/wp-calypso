import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import { describeBuildContext, readProperty, tagOwnBuild } from '../lib/teamcity';

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
	test( 'unescapes the forms java.util.Properties.store() emits', () => {
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

		expect( describeBuildContext() ).toEqual( {
			propertiesFile: false,
			serverUrl: null,
			buildId: null,
			credentials: false,
		} );
		await expect( tagOwnBuild( 'throttle-signup' ) ).resolves.toBeNull();
		expect( fetchSpy ).not.toHaveBeenCalled();
	} );

	test( 'properties file missing keys: no credentials, no request', async () => {
		writeProperties( 'teamcity.build.id=18847887\n' );
		const fetchSpy = jest.spyOn( globalThis, 'fetch' );

		expect( describeBuildContext().credentials ).toBe( false );
		await expect( tagOwnBuild( 'throttle-signup' ) ).resolves.toBeNull();
		expect( fetchSpy ).not.toHaveBeenCalled();
	} );

	test( 'unreadable properties file: no credentials, no request', async () => {
		process.env.TEAMCITY_BUILD_PROPERTIES_FILE = path.join( dir, 'does-not-exist' );
		const fetchSpy = jest.spyOn( globalThis, 'fetch' );

		expect( describeBuildContext().credentials ).toBe( false );
		await expect( tagOwnBuild( 'throttle-signup' ) ).resolves.toBeNull();
		expect( fetchSpy ).not.toHaveBeenCalled();
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

		await expect( tagOwnBuild( 'throttle-signup-123' ) ).resolves.toBeNull();

		for ( const spy of consoleSpies ) {
			expect( spy ).not.toHaveBeenCalled();
		}
	} );

	test( 'a request that never settles is abandoned, not left hanging', async () => {
		writeProperties( completeProperties() );
		jest.spyOn( globalThis, 'fetch' ).mockImplementation(
			( _url, init ) =>
				new Promise( ( _resolve, reject ) => {
					( init as RequestInit ).signal?.addEventListener( 'abort', () =>
						reject( new Error( 'aborted' ) )
					);
				} )
		);

		await expect( tagOwnBuild( 'throttle-signup-123', 10 ) ).resolves.toBeNull();
	} );

	test( 'a non-200 response is reported as a status, not thrown', async () => {
		writeProperties( completeProperties() );
		jest
			.spyOn( globalThis, 'fetch' )
			.mockResolvedValue( new Response( 'Access denied', { status: 403 } ) );

		await expect( tagOwnBuild( 'throttle-signup-123' ) ).resolves.toBe( 403 );
	} );

	test( 'the non-secret summary never carries a credential', () => {
		writeProperties( completeProperties() );

		const summary = describeBuildContext();
		expect( summary ).toEqual( {
			propertiesFile: true,
			serverUrl: 'https://teamcity.example.com',
			buildId: '18847887',
			credentials: true,
		} );
		expect( JSON.stringify( summary ) ).not.toContain( PASSWORD );
	} );
} );
