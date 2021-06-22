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

describe( 'Signup Flows Configuration', () => {
	describe( 'getFlow', () => {
		beforeAll( () => {
			sinon.stub( flows, 'getFlows' ).returns( mockedFlows );
		} );

		afterAll( () => {
			flows.getFlows.restore();
		} );

		test( 'should return the full flow when the user is not logged in', () => {
			assert.deepEqual( flows.getFlow( 'main', false ).steps, [ 'user', 'site' ] );
		} );

		test( 'should remove the user step from the flow when the user is logged in', () => {
			assert.deepEqual( flows.getFlow( 'main', true ).steps, [ 'site' ] );
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
			assert.deepEqual( flows.getFlow( 'main', false ).steps, [ 'user' ] );
		} );
	} );
} );
