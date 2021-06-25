const testFramework = require( '../index' );

describe( 'settings', function () {
	it( 'stores paths to tests and mocha config', function () {
		testFramework.initialize( {
			mocha_tests: [ './test_support/basic' ],
			mocha_config: './test_support/basic/.mocharc.js',
		} );
		expect( testFramework.settings.mochaTestFolders ).toEqual( [ './test_support/basic' ] );
		expect( testFramework.settings.mochaConfig ).toBe( './test_support/basic/.mocharc.js' );
	} );
} );
