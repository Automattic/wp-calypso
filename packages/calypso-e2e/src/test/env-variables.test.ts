import { afterAll, beforeEach, describe, expect, test } from '@jest/globals';
import envVariables, { ATOMIC_VARIATIONS } from '../env-variables';

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

	describe( 'Test: a mixed Atomic run picks its variation from the run counter', function () {
		const ambientVariation = process.env.ATOMIC_VARIATION;
		const ambientIndex = process.env.ATOMIC_VARIATION_INDEX;
		const VARIATION_COUNT = ATOMIC_VARIATIONS.length;

		beforeEach( function () {
			process.env.ATOMIC_VARIATION = 'mixed';
		} );

		afterAll( function () {
			restore( 'ATOMIC_VARIATION', ambientVariation );
			restore( 'ATOMIC_VARIATION_INDEX', ambientIndex );
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
		 * Resolves the variation the given run counter gets.
		 */
		function variationFor( runIndex: number ) {
			process.env.ATOMIC_VARIATION_INDEX = String( runIndex );
			return envVariables.ATOMIC_VARIATION;
		}

		test( 'consecutive runs walk every variation', function () {
			const variations = Array.from( { length: VARIATION_COUNT }, ( _value, index ) =>
				variationFor( 100 + index )
			);

			expect( new Set( variations ).size ).toBe( VARIATION_COUNT );
			expect( variations ).not.toContain( 'mixed' );
		} );

		// Every read within a run has to agree: a spec picks its account and builds its suite
		// title when Playwright collects it, and resolves its skip guards in the worker.
		test( 'the same run counter always resolves to the same variation', function () {
			expect( variationFor( 12 ) ).toBe( variationFor( 12 ) );
			expect( variationFor( 12 + VARIATION_COUNT ) ).toBe( variationFor( 12 ) );
		} );

		test( 'a run with no counter still resolves to a variation', function () {
			delete process.env.ATOMIC_VARIATION_INDEX;

			expect( envVariables.ATOMIC_VARIATION ).toBe( 'default' );
		} );

		// A counter that is not a whole number leaves no variation to run against, so it has to
		// stop the run rather than resolve to undefined.
		test.each( [ 'today', 'Infinity', '1e999' ] )(
			'the counter %p is rejected',
			function ( value ) {
				process.env.ATOMIC_VARIATION_INDEX = value;

				expect( () => envVariables.ATOMIC_VARIATION ).toThrow( 'ATOMIC_VARIATION_INDEX' );
			}
		);
	} );
} );
