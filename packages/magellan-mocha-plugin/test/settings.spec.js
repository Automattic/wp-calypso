const chai = require( 'chai' );
const expect = chai.expect;
const testFramework = require( '../index' );

describe( 'settings', function () {
	it( 'stores paths to tests and mocha.opts', function () {
		testFramework.initialize( {
			mocha_tests: [ './test_support/basic' ],
			mocha_opts: './test_support/basic/mocha.opts',
		} );
		expect( testFramework.settings.mochaTestFolders ).to.deep.equal( [ './test_support/basic' ] );
		expect( testFramework.settings.mochaOpts ).to.equal( './test_support/basic/mocha.opts' );
	} );
} );
