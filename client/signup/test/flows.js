/**
 * External dependencies
 */
var assert = require( 'assert' );

describe( 'flows', function() {
	var flows, user;

	require( 'test/helpers/use-filesystem-mocks' )( __dirname );

	before( () => {
		flows = require( 'signup/config/flows' );
		user = require( 'lib/user' )();
	} );

	it( 'should return the full flow when the user is not logged in', function() {
		assert.deepEqual( flows.getFlow( 'main' ).steps, [ 'user', 'site' ] );
	} );

	it( 'should remove the user step from the flow when the user is not logged in', function() {
		user.setLoggedIn( true );
		assert.deepEqual( flows.getFlow( 'main' ).steps, [ 'site' ] );
		user.setLoggedIn( false );
	} );
} );
