import crypto from 'crypto';
import vm from 'vm';
import { afterAll, beforeEach, describe, expect, jest, test } from '@jest/globals';
import envVariables, {
	ATOMIC_VARIATIONS,
	MIXED_RUN_WORKERS,
	assignAtomicVariations,
	createAtomicSiteProjects,
	setRunningSpecFile,
} from '../env-variables';

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
		const ambientAssignment = process.env.ATOMIC_VARIATION_BY_SPEC;
		const VARIATION_COUNT = ATOMIC_VARIATIONS.length;
		const SPEC_FILE = '/agent/test/e2e/specs/blocks/blocks__jetpack-other.spec.ts';
		// As many as the mixed run has: 24 files over 7 sites leave 3 sites with a file more.
		const SPEC_FILES = [
			SPEC_FILE,
			...Array.from( { length: 23 }, ( _value, index ) => `area/spec-${ index }.spec.ts` ),
		];

		beforeEach( function () {
			process.env.ATOMIC_VARIATION = 'mixed';
			process.env.ATOMIC_VARIATION_KEY = sha( 1 );
			publish();
			setRunningSpecFile( undefined );
		} );

		afterAll( function () {
			restore( 'ATOMIC_VARIATION', ambientVariation );
			restore( 'ATOMIC_VARIATION_KEY', ambientKey );
			restore( 'ATOMIC_VARIATION_BY_SPEC', ambientAssignment );
			setRunningSpecFile( undefined );
		} );

		/**
		 * Publishes the assignment for the current key, the way the Playwright config does.
		 */
		function publish() {
			process.env.ATOMIC_VARIATION_BY_SPEC = JSON.stringify( assignAtomicVariations( SPEC_FILES ) );
		}

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

		// Each site gets its own capped workers, so the busiest site sets the run's length.
		test.each( [ 1, 2, 3 ] )(
			'commit %i spreads spec files evenly over every variation',
			function ( index ) {
				process.env.ATOMIC_VARIATION_KEY = sha( index );
				const files = Object.values( assignAtomicVariations( SPEC_FILES ) );
				const counts = ATOMIC_VARIATIONS.map(
					( variation ) => files.filter( ( file ) => file === variation ).length
				);

				expect( files ).toHaveLength( SPEC_FILES.length );
				expect( Math.min( ...counts ) ).toBe( 3 );
				expect( Math.max( ...counts ) ).toBe( 4 );
			}
		);

		test( 'consecutive commits move a spec file over every variation', function () {
			const variations = Array.from( { length: 30 }, ( _value, index ) => {
				process.env.ATOMIC_VARIATION_KEY = sha( index );
				publish();
				return variationInTest( SPEC_FILE );
			} );

			expect( new Set( variations ).size ).toBe( VARIATION_COUNT );
		} );

		// A fixed first site would leave the sites after it a file short on every run.
		test( 'consecutive commits give the extra files to every variation', function () {
			const busiest = new Set(
				Array.from( { length: 30 }, ( _value, index ) => {
					process.env.ATOMIC_VARIATION_KEY = sha( index );
					const files = Object.values( assignAtomicVariations( SPEC_FILES ) );
					return ATOMIC_VARIATIONS.filter(
						( variation ) => files.filter( ( file ) => file === variation ).length === 4
					);
				} ).flat()
			);

			expect( busiest.size ).toBe( VARIATION_COUNT );
		} );

		// Rotating a fixed grouping would always send the same files to a site together.
		test( 'consecutive commits regroup the spec files', function () {
			const sharesSiteWithSpecFile = ( index: number ) => {
				process.env.ATOMIC_VARIATION_KEY = sha( index );
				const assignment = assignAtomicVariations( SPEC_FILES );
				const site = assignment[ 'blocks__jetpack-other.spec.ts' ];
				return Object.keys( assignment ).filter( ( file ) => assignment[ file ] === site );
			};

			expect( sharesSiteWithSpecFile( 2 ) ).not.toEqual( sharesSiteWithSpecFile( 1 ) );
		} );

		// A re-run of the same commit has to retest the variation that failed.
		test( 'the same commit always assigns the same variations', function () {
			expect( assignAtomicVariations( [ ...SPEC_FILES ].reverse() ) ).toEqual(
				assignAtomicVariations( SPEC_FILES )
			);
		} );

		// Files whose hashes collide still have to keep their variations across re-runs.
		test( 'the same commit assigns the same variations when hashes collide', function () {
			const collision = jest.spyOn( crypto, 'createHash' ).mockReturnValue( {
				update() {
					return this;
				},
				digest: () => '0'.repeat( 32 ),
			} as unknown as crypto.Hash );

			try {
				expect( assignAtomicVariations( [ ...SPEC_FILES ].reverse() ) ).toEqual(
					assignAtomicVariations( SPEC_FILES )
				);
				expect( collision ).toHaveBeenCalled();
			} finally {
				collision.mockRestore();
			}
		} );

		// A re-run on a machine with another locale, e.g. da_DK sorting "aa" after "f", has to match.
		test( 'the assignment ignores the locale', function () {
			const expected = assignAtomicVariations( SPEC_FILES );
			const reversedCollation = jest
				.spyOn( String.prototype, 'localeCompare' )
				.mockImplementation( function ( this: string, other: string ) {
					return this < other ? 1 : -1;
				} );

			try {
				expect( assignAtomicVariations( SPEC_FILES ) ).toEqual( expected );
			} finally {
				reversedCollation.mockRestore();
			}
		} );

		// Two files sharing a name would share a site, and one site's count would be off.
		test( 'two spec files with the same name stop the run', function () {
			expect( () => assignAtomicVariations( [ 'a/same.spec.ts', 'b/same.spec.ts' ] ) ).toThrow(
				'two are named same.spec.ts'
			);
		} );

		// More than 2 tests at once on one site time out.
		test( 'each site gets a project running its spec files on at most 2 workers', function () {
			const projects = createAtomicSiteProjects( { name: 'chrome', retries: 1 }, SPEC_FILES );

			expect( projects.map( ( project ) => project.name ) ).toEqual(
				ATOMIC_VARIATIONS.map( ( variation ) => `chrome-atomic-${ variation }` )
			);
			expect( projects.map( ( project ) => project.workers ) ).toEqual(
				ATOMIC_VARIATIONS.map( () => 2 )
			);
			expect( projects.map( ( project ) => project.retries ) ).toEqual(
				ATOMIC_VARIATIONS.map( () => 1 )
			);
			expect( projects.flatMap( ( project ) => project.testMatch ).sort() ).toEqual(
				[ ...SPEC_FILES ].sort()
			);
		} );

		// The project routes a file to a site's capped workers; the variation its test reads
		// has to be that site's.
		test( 'a site project runs only spec files that resolve to its variation', function () {
			delete process.env.ATOMIC_VARIATION_BY_SPEC;
			const projects = createAtomicSiteProjects( { name: 'chrome' }, SPEC_FILES );

			projects.forEach( ( project, index ) => {
				project.testMatch.forEach( ( file ) => {
					expect( variationInTest( file ) ).toBe( ATOMIC_VARIATIONS[ index ] );
				} );
			} );
		} );

		test( 'a mixed run has 2 workers for every site', function () {
			expect( MIXED_RUN_WORKERS ).toBe( 2 * VARIATION_COUNT );
		} );

		// A spec the config did not find would otherwise run on whichever site it guessed,
		// uncapped.
		test( 'a spec file with no assigned variation stops the run', function () {
			expect( () => variationInTest( 'area/untagged.spec.ts' ) ).toThrow(
				'assigns no variation to untagged.spec.ts'
			);
		} );

		test( 'a run outside the Playwright config stops the run', function () {
			delete process.env.ATOMIC_VARIATION_BY_SPEC;

			expect( () => variationInTest( SPEC_FILE ) ).toThrow( 'ATOMIC_VARIATION_BY_SPEC' );
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

		// A test runs its own spec file's code, so the stack and the fixture name the same file
		// even though the fixture records the path relative to the specs directory.
		test( 'a spec file on the call stack agrees with its own running test', function () {
			const expected = variationInTest( SPEC_FILE );
			setRunningSpecFile( 'blocks/blocks__jetpack-other.spec.ts' );

			expect( variationInModule( SPEC_FILE ) ).toBe( expected );
		} );

		// A spec calling code from another spec would resolve that spec's variation while the
		// account fixture picks the running spec's site: one test on two sites.
		test( 'a spec file on the call stack that is not the running test stops the run', function () {
			setRunningSpecFile( 'area/unrelated.spec.ts' );

			expect( () => variationInModule( SPEC_FILE ) ).toThrow(
				'blocks__jetpack-other.spec.ts is read while a test of unrelated.spec.ts runs'
			);
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

			expect( () => assignAtomicVariations( SPEC_FILES ) ).toThrow( 'ATOMIC_VARIATION_KEY' );
			expect( () => envVariables.validate() ).toThrow( 'ATOMIC_VARIATION_KEY' );
		} );
	} );
} );
