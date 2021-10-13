/**
 * @jest-environment jsdom
 */

import assert from 'assert';
import sinon from 'sinon';
import flows from 'calypso/signup/config/flows';
import mockedFlows from './fixtures/flows';

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
