const chai = require( 'chai' );
const expect = chai.expect;
const profile = require( '../lib/profile' );

describe( 'profile', function () {
	it( 'no browser is passed', function () {
		expect( profile.getProfiles( [] ) ).to.eql( [] );
	} );

	it( 'browser is passed', function () {
		expect( profile.getProfiles( [ 'chrome' ] ) ).to.eql( [ { id: 'mocha' } ] );
	} );

	it( 'getCapabilities', function () {
		expect( profile.getCapabilities() ).to.eql( { id: 'mocha' } );
	} );

	it( 'listBrowsers', function () {
		expect( profile.listBrowsers() ).to.eql( [ 'mocha' ] );
	} );
} );
