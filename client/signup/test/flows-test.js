/**
 * External dependencies
 */
var assert = require( 'assert' );

/**
 * Internal dependencies
 */
var flows = require( 'signup/config/flows' ),
	user = require( 'lib/user' )();

describe( 'flows.js', function() {
	it( 'should return the full flow when the user is not logged in', function() {
		assert.deepEqual( flows.getFlow( 'main' ).steps, [ 'user', 'site' ] );
	} );

	it( 'should remove the user step from the flow when the user is not logged in', function() {
		user.setLoggedIn( true );
		assert.deepEqual( flows.getFlow( 'main' ).steps, [ 'site' ] );
		user.setLoggedIn( false );
	} );
} );
