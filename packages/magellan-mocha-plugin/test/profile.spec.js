const profile = require( '../lib/profile' );

describe( 'profile', function () {
	it( 'no browser is passed', function () {
		expect( profile.getProfiles( [] ) ).toEqual( [] );
	} );

	it( 'browser is passed', function () {
		expect( profile.getProfiles( [ 'chrome' ] ) ).toEqual( [ { id: 'mocha' } ] );
	} );

	it( 'getCapabilities', function () {
		expect( profile.getCapabilities() ).toEqual( { id: 'mocha' } );
	} );

	it( 'listBrowsers', function () {
		expect( profile.listBrowsers() ).toEqual( [ 'mocha' ] );
	} );
} );
