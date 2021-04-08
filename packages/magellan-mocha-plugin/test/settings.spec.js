const testFramework = require( '../index' );

describe( 'settings', function () {
	it( 'stores paths to tests and mocha.opts', function () {
		testFramework.initialize( {
			mocha_tests: [ './test_support/basic' ],
			mocha_opts: './test_support/basic/mocha.opts',
		} );
		expect( testFramework.settings.mochaTestFolders ).toEqual( [ './test_support/basic' ] );
		expect( testFramework.settings.mochaOpts ).toBe( './test_support/basic/mocha.opts' );
	} );
} );
