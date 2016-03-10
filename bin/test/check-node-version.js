global.TEST_VERSION_COMPARE = true;

/**
 * External dependencies
 */
const expect = require( 'chai' ).expect;

/**
 * Internal dependencies
 */
const versionIsAtLeast = require( '../check-node-version' ).versionIsAtLeast;

describe( 'check-node-version versionIsAtLeast', () => {
	it( 'should fail if major version mismatches', () => {
		expect( versionIsAtLeast( '4.3.0', '3.5.5' ) ).to.eql( false );
	} );

	it( 'should fail if minor version mismatches', () => {
		expect( versionIsAtLeast( '4.3.0', '4.2.5' ) ).to.eql( false );
	} );

	it( 'should fail if patch version mismatches', () => {
		expect( versionIsAtLeast( '4.3.1', '4.3.0' ) ).to.eql( false );
	} );

	it( 'should succeed if everything looks OK', () => {
		expect( versionIsAtLeast( '4.3.0', '4.3.0' ) ).to.eql( true );
		expect( versionIsAtLeast( '4.3.0', '4.3.1' ) ).to.eql( true );
		expect( versionIsAtLeast( '4.3.0', '4.4.1' ) ).to.eql( true );
		expect( versionIsAtLeast( '4.3.2', '5.0.0' ) ).to.eql( true );
	} );

	it( 'should fail if patch version required but none present', () => {
		expect( versionIsAtLeast( '4.3.1', '4.3' ) ).to.eql( false );
	} );

	it( 'should succeed if patch version not required', () => {
		expect( versionIsAtLeast( '4.3', '4.3' ) ).to.eql( true );
		expect( versionIsAtLeast( '4.3', '4.3.1' ) ).to.eql( true );
		expect( versionIsAtLeast( '4.3', '4.4.1' ) ).to.eql( true );
		expect( versionIsAtLeast( '4.3', '4.4' ) ).to.eql( true );
	} );
} );
