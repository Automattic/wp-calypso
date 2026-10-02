import vm from 'vm';
import { afterAll, beforeEach, describe, expect, test } from '@jest/globals';
import envVariables, { ATOMIC_VARIATIONS, setRunningSpecFile } from '../env-variables';

const URL_ENV_VARS = [
	'A8C_FOR_AGENCIES_URL',
	'CALYPSO_BASE_URL',
	'DASHBOARD_BASE_URL',
	'PARTNER_DIRECTORY_BASE_URL',
	'WOO_BASE_URL',
	'WPCOM_BASE_URL',
] as const;

const AMBIENT_VALUES = URL_ENV_VARS.map( ( name ) => process.env[ name ] );

describe( 'EnvVariables Tests', function () {
	// Each case starts from the unset state so the assertions never depend on the
	// shell that launched Jest, or on the order the cases run in.
	beforeEach( function () {
		URL_ENV_VARS.forEach( ( name ) => delete process.env[ name ] );
	} );

	// Jest workers are reused across test files, so hand the environment back.
	afterAll( function () {
		URL_ENV_VARS.forEach( ( name, index ) => {
			const ambient = AMBIENT_VALUES[ index ];
			if ( ambient === undefined ) {
				delete process.env[ name ];
			} else {
				process.env[ name ] = ambient;
			}
		} );
	} );

	// CI templates export these unconditionally, so an unset variable arrives as an
	// empty string rather than undefined. Falling through to the default keeps a
	// build that never opted into an override from crashing at spec collection.
	describe( 'Test: URL environment variables fall back to defaults when empty', function () {
		test.each( URL_ENV_VARS )( '%s falls back when set to an empty string', function ( name ) {
			const unset = envVariables[ name ];

			process.env[ name ] = '';

			expect( envVariables[ name ] ).toBe( unset );
		} );
	} );

	describe( 'Test: URL environment variables honour overrides', function () {
		test.each( URL_ENV_VARS )( '%s uses the provided value', function ( name ) {
			process.env[ name ] = 'https://example.com/';

			expect( envVariables[ name ] ).toBe( 'https://example.com/' );
		} );

		test.each( URL_ENV_VARS )( '%s rejects a malformed value', function ( name ) {
			process.env[ name ] = 'not-a-url';

			expect( () => envVariables[ name ] ).toThrow( `Invalid ${ name } value` );
		} );
	} );

	describe( 'Test: a mixed Atomic run picks a variation per spec file', function () {
		const ambientVariation = process.env.ATOMIC_VARIATION;
		const ambientKey = process.env.ATOMIC_VARIATION_KEY;
		const VARIATION_COUNT = ATOMIC_VARIATIONS.length;
		const SPEC_FILE = '/agent/test/e2e/specs/blocks/blocks__jetpack-other.spec.ts';

		beforeEach( function () {
			process.env.ATOMIC_VARIATION = 'mixed';
			process.env.ATOMIC_VARIATION_KEY = sha( 1 );
			setRunningSpecFile( undefined );
		} );

		afterAll( function () {
			restore( 'ATOMIC_VARIATION', ambientVariation );
			restore( 'ATOMIC_VARIATION_KEY', ambientKey );
			setRunningSpecFile( undefined );
		} );

		/**
		 * Restores an environment variable, which Jest workers carry into the next test file.
		 */
		function restore( name: string, ambient: string | undefined ) {
			if ( ambient === undefined ) {
				delete process.env[ name ];
			} else {
				process.env[ name ] = ambient;
			}
		}

		/**
		 * Builds a commit SHA out of a counter.
		 */
		function sha( index: number ) {
			return index.toString( 16 ).padStart( 40, '0' );
		}

		/**
		 * Resolves the variation a test of the given spec file gets, the way a worker does.
		 */
		function variationInTest( file: string ) {
			setRunningSpecFile( file );
			return envVariables.ATOMIC_VARIATION;
		}

		/**
		 * Resolves the variation while the given spec file is on the call stack, the way
		 * Playwright's collector does when it loads the file.
		 */
		function variationInModule( file: string ) {
			const read = vm.runInThisContext( '( env ) => env.ATOMIC_VARIATION', { filename: file } );
			return read( envVariables );
		}

		test( 'spec files spread over every variation', function () {
			const variations = Array.from( { length: 30 }, ( _value, index ) =>
				variationInTest( `/agent/test/e2e/specs/area/spec-${ index }.spec.ts` )
			);

			expect( new Set( variations ).size ).toBe( VARIATION_COUNT );
			expect( variations ).not.toContain( 'mixed' );
		} );

		test( 'consecutive commits move a spec file over every variation', function () {
			const variations = Array.from( { length: 30 }, ( _value, index ) => {
				process.env.ATOMIC_VARIATION_KEY = sha( index );
				return variationInTest( SPEC_FILE );
			} );

			expect( new Set( variations ).size ).toBe( VARIATION_COUNT );
		} );

		// A re-run of the same commit has to retest the variation that failed.
		test( 'the same commit and spec file always resolve to the same variation', function () {
			expect( variationInTest( SPEC_FILE ) ).toBe( variationInTest( SPEC_FILE ) );
		} );

		// Playwright collects a spec in one process and runs it in another, possibly on a
		// different agent checkout: the suite title and skip guards declared at collection
		// have to match what the worker declares and what its fixtures pick.
		test( 'the collector and the worker agree on a spec file', function () {
			const collected = variationInModule( SPEC_FILE );

			expect( variationInTest( '/other-agent/specs/blocks/blocks__jetpack-other.spec.ts' ) ).toBe(
				collected
			);
		} );

		// The spec file on the stack is the one reading the variation, whatever a fixture recorded.
		test( 'a spec file on the call stack wins over the running test', function () {
			const other = Array.from(
				{ length: 30 },
				( _value, index ) => `/agent/specs/area/spec-${ index }.spec.ts`
			).find( ( file ) => variationInTest( file ) !== variationInModule( SPEC_FILE ) );

			expect( other ).toBeDefined();
			setRunningSpecFile( other );

			expect( variationInModule( SPEC_FILE ) ).toBe( variationInTest( SPEC_FILE ) );
		} );

		// Falling back to one variation for the whole run would hide which spec file it was for.
		test( 'a read outside any spec file stops the run', function () {
			expect( () => envVariables.ATOMIC_VARIATION ).toThrow( 'spec file' );
		} );

		// The Playwright config validates the environment before any spec file loads.
		test( 'validation accepts a mixed run outside any spec file', function () {
			expect( () => envVariables.validate() ).not.toThrow();
		} );

		// Silently running `default` would leave the other variations untested for as long as the
		// key is missing, so a mixed run without one has to stop.
		test( 'a run with no key stops the run', function () {
			delete process.env.ATOMIC_VARIATION_KEY;

			expect( () => variationInTest( SPEC_FILE ) ).toThrow( 'ATOMIC_VARIATION_KEY' );
			expect( () => envVariables.validate() ).toThrow( 'ATOMIC_VARIATION_KEY' );
		} );
	} );
} );
