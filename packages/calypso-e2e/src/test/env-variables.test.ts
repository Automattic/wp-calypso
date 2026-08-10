import path from 'path';
import { afterAll, beforeEach, describe, expect, jest, test } from '@jest/globals';
import envVariables from '../env-variables';

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

	describe( 'Test: a mixed Atomic run spreads variations across spec files', function () {
		const ambient = process.env.ATOMIC_VARIATION;
		const globalsPath = path.join(
			path.dirname( require.resolve( 'playwright/package.json' ) ),
			'lib',
			'common',
			'globals.js'
		);
		// Every spec that reads the variation on a private site, plus a few that do not, so the
		// assertions below run against the real spread of names rather than invented ones.
		const SPEC_FILES = [
			'blocks__jetpack-forms.spec.ts',
			'blocks__jetpack-media.spec.ts',
			'blocks__jetpack-other.spec.ts',
			'blocks__jetpack-earn.spec.ts',
			'editor__post-basic-flow.spec.ts',
			'forms__submissions.spec.ts',
			'jetpack__dashboard-smoke.spec.ts',
			'social__editor-features.spec.ts',
			'stats.spec.ts',
		];

		let loadingFile = '';

		beforeEach( function () {
			jest.resetModules();
			jest.doMock( globalsPath, function () {
				return {
					currentlyLoadingFileSuite: () => ( { location: { file: loadingFile } } ),
					currentTestInfo: () => null,
				};
			} );
		} );

		afterAll( function () {
			jest.useRealTimers();
			jest.resetModules();
			if ( ambient === undefined ) {
				delete process.env.ATOMIC_VARIATION;
			} else {
				process.env.ATOMIC_VARIATION = ambient;
			}
		} );

		/**
		 * Resolves the variation one spec file would get, reloading the module so the case starts
		 * without the memoised variations of the last one.
		 */
		function variationFor( specFile: string ) {
			loadingFile = `/checkout/test/e2e/specs/${ specFile }`;
			process.env.ATOMIC_VARIATION = 'mixed';

			let variation;
			jest.isolateModules( function () {
				// eslint-disable-next-line @typescript-eslint/no-require-imports
				variation = require( '../env-variables' ).default.ATOMIC_VARIATION;
			} );
			return variation;
		}

		test( 'one run covers more than one variation', function () {
			jest.useFakeTimers();
			jest.setSystemTime( new Date( '2026-08-10T09:00:00Z' ) );

			expect( new Set( SPEC_FILES.map( variationFor ) ).size ).toBeGreaterThan( 1 );
		} );

		// The account and suite title are fixed at load, the skip guards run much later. A run that
		// crosses midnight must not leave those two pointing at different sites.
		test( 'a spec keeps its variation when the clock rolls over to the next day', function () {
			jest.useFakeTimers();
			jest.setSystemTime( new Date( '2026-08-10T23:59:00Z' ) );

			loadingFile = '/checkout/test/e2e/specs/forms__submissions.spec.ts';
			process.env.ATOMIC_VARIATION = 'mixed';

			jest.isolateModules( function () {
				// eslint-disable-next-line @typescript-eslint/no-require-imports
				const envVars = require( '../env-variables' ).default;
				const resolved = envVars.ATOMIC_VARIATION;

				jest.setSystemTime( new Date( '2026-08-11T00:01:00Z' ) );

				expect( envVars.ATOMIC_VARIATION ).toBe( resolved );
				expect( resolved ).not.toBe( 'mixed' );
			} );
		} );
	} );
} );
