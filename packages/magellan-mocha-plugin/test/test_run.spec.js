/* eslint no-undef: 0, no-unused-expressions: 0, filenames/filenames: 0 */
'use strict';

var chai = require( 'chai' );
var expect = chai.expect;
var testFramework = require( '../index' );
var TestRun = testFramework.TestRun;

/*eslint-disable no-magic-numbers*/
describe( 'TestRun class', function () {
	var run;

	beforeEach( function () {
		run = new TestRun( {
			locator: {
				name: 'The full name of the test to run',
			},
			mockingPort: 10,
		} );
	} );

	it( 'instantiates', function () {
		expect( run.locator.name ).to.equal( 'The full name of the test to run' );
		expect( run.mockingPort ).to.equal( 10 );
	} );

	it( 'returns path to mocha', function () {
		expect( run.getCommand() ).to.equal( './node_modules/.bin/mocha' );
	} );

	it( 'returns the environment for a run', function () {
		var env = run.getEnvironment( {
			NODE_CONFIG: { foo: 'bar' },
		} );

		// these values are super important, to be used by the testing tools in the worker processes
		expect( env ).to.deep.equal( {
			NODE_CONFIG: { foo: 'bar' },
		} );
	} );

	it( 'returns the arguments for a run', function () {
		testFramework.initialize( {
			mocha_tests: [ 'path/to/specs', 'another/path/to/specs' ],
			mocha_opts: 'path/to/mocha.opts',
		} );

		var localRun = new TestRun( {
			locator: {
				name: 'The full name of the test to run',
			},
			mockingPort: 10,
		} );

		var args = localRun.getArguments();
		expect( args ).to.deep.equal( [
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
