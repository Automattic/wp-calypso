/**
 * External dependencies
 */
import assert from 'assert';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import useFilesystemMocks from 'test/helpers/use-filesystem-mocks';
import useMockery from 'test/helpers/use-mockery';
import useFakeDom from 'test/helpers/use-fake-dom';
import mockedFlows from './fixtures/flows';

describe( 'flows', function() {
	let flows, user;

	useFakeDom();
	useFilesystemMocks( __dirname );

	useMockery( ( mockery ) => {
		mockery.registerMock( 'lib/abtest', {
			abtest: () => ''
		} );
	} );

	before( () => {
		user = require( 'lib/user' )();

		flows = require( 'signup/config/flows' );
		sinon.stub( flows, 'getFlows' ).returns( mockedFlows );
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
