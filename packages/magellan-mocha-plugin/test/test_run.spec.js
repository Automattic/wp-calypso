const testFramework = require( '../index' );
const TestRun = testFramework.TestRun;

describe( 'TestRun class', function () {
	let run;

	beforeEach( function () {
		run = new TestRun( {
			locator: {
				name: 'The full name of the test to run',
			},
			mockingPort: 10,
		} );
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
		} );
	} );

	it( 'returns the arguments for a run', function () {
		testFramework.initialize( {
			mocha_tests: [ 'path/to/specs', 'another/path/to/specs' ],
			mocha_opts: 'path/to/mocha.opts',
		} );

		const localRun = new TestRun( {
			locator: {
				name: 'The full name of the test to run',
			},
			mockingPort: 10,
		} );

		const args = localRun.getArguments();
		expect( args ).toEqual( [
			'--mocking_port=10',
			'--worker=1',
			'-g',
			'The full name of the test to run',
			'--opts',
			'path/to/mocha.opts',
			'path/to/specs',
			'another/path/to/specs',
		] );
	} );
} );
