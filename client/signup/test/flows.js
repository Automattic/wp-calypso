/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import assert from 'assert'; // eslint-disable-line import/no-nodejs-modules
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import mockedFlows from './fixtures/flows';
import flows from 'calypso/signup/config/flows';
import userFactory from 'calypso/lib/user';

jest.mock( 'lib/user', () => require( './mocks/lib/user' ) );

describe( 'Signup Flows Configuration', () => {
	describe( 'getFlow', () => {
		let user;

		beforeAll( () => {
			user = userFactory();

			sinon.stub( flows, 'getFlows' ).returns( mockedFlows );
		} );

		afterAll( () => {
			flows.getFlows.restore();
		} );

		test( 'should return the full flow when the user is not logged in', () => {
			assert.deepEqual( flows.getFlow( 'main' ).steps, [ 'user', 'site' ] );
		} );

		test( 'should remove the user step from the flow when the user is logged in', () => {
			user.setLoggedIn( true );
			assert.deepEqual( flows.getFlow( 'main' ).steps, [ 'site' ] );
			user.setLoggedIn( false );
		} );
	} );

	describe( 'excludeSteps', () => {
		beforeAll( () => {
			sinon.stub( flows, 'getFlows' ).returns( mockedFlows );
		} );

		afterAll( () => {
			flows.getFlows.restore();
			flows.excludeStep();
		} );

		test( 'should exclude site step from getFlow', () => {
			flows.excludeStep( 'site' );
			assert.deepEqual( flows.getFlow( 'main' ).steps, [ 'user' ] );
		} );
	} );
} );
