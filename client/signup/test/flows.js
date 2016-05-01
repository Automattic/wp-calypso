/**
 * External dependencies
 */
var assert = require( 'assert' );

/**
 * Internal dependencies
 */
import useFilesystemMocks from 'test/helpers/use-filesystem-mocks';
import useI18n from 'test/helpers/use-i18n';
import useMockery from 'test/helpers/use-mockery';

describe( 'flows', function() {
	var flows, user;

	useFilesystemMocks( __dirname );
	useI18n();
	useMockery( ( mockery ) => {
		mockery.registerMock( 'lib/abtest', {
			abtest: () => ''
		} );
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
