const testFramework = require( '../index' );
const TestRun = testFramework.TestRun;
const mockFs = require( 'mock-fs' );

describe( 'TestRun class', function () {
	let run;

	beforeEach( function () {
		mockFs( {
			'/tmp': {},
		} );

		run = new TestRun( {
			locator: {
				name: 'The full name of the test to run',
			},
			mockingPort: 10,
			tempAssetPath: '/tmp',
		} );
	} );

	afterEach( () => {
		mockFs.restore();
	} );

	it( 'instantiates', function () {
		expect( run.locator.name ).toBe( 'The full name of the test to run' );
		expect( run.mockingPort ).toBe( 10 );
	} );

	it( 'returns path to mocha', function () {
		expect( run.getCommand() ).toBe( './node_modules/.bin/mocha' );
	} );

	it( 'returns the environment for a run', function () {
		const env = run.getEnvironment( {
			NODE_CONFIG: { foo: 'bar' },
		} );

		// these values are super important, to be used by the testing tools in the worker processes
		expect( env ).toEqual( {
			NODE_CONFIG: { foo: 'bar' },
			TEMP_ASSET_PATH: '/the-full-name-of-the-test-to-run',
		} );
	} );

	it( 'returns the arguments for a run', function () {
		testFramework.initialize( {
			mocha_tests: [ 'path/to/specs', 'another/path/to/specs' ],
			mocha_config: 'path/to/.mocharc.js',
		} );

		const localRun = new TestRun( {
			locator: {
				name: 'The full name of the test to run',
			},
			mockingPort: 10,
			tempAssetPath: '/tmp',
		} );

		const args = localRun.getArguments();
		expect( args ).toEqual( [
			'--bail',
			'--mocking_port=10',
			'--worker=1',
			'-g',
			'The full name of the test to run',
			'--config',
			'path/to/.mocharc.js',
			'path/to/specs',
			'another/path/to/specs',
		] );
	} );
} );
