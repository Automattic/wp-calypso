/**
 * @format
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
import flows from 'signup/config/flows';
import userFactory from 'lib/user';

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

	describe( 'includeSteps', () => {
		beforeAll( () => {
			sinon.stub( flows, 'getFlows' ).returns( mockedFlows );
		} );

		afterAll( () => {
			flows.getFlows.restore();
		} );

		test( 'including step that was never excluded has no effect', () => {
			flows.includeStep( 'site' );
			assert.deepEqual( flows.getFlow( 'main' ).steps, [ 'user', 'site' ] );
		} );

		test( "including step that doesn't exist has no effect", () => {
			flows.includeStep( 'fake' );
			assert.deepEqual( flows.getFlow( 'main' ).steps, [ 'user', 'site' ] );
		} );

		test( 'including step after it was excluded restores the step', () => {
			flows.excludeStep( 'site' );
			flows.excludeStep( 'user' );
			flows.includeStep( 'site' );
			assert.deepEqual( flows.getFlow( 'main' ).steps, [ 'site' ] );
		} );
	} );
} );
