/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	plansReceiveAction,
	plansRequestAction,
	plansRequestSuccessAction,
	plansRequestFailureAction,
	requestPlans
} from '../actions';
import useNock from 'test/helpers/use-nock';
import { useSandbox } from 'test/helpers/use-sinon';

/**
 * Fixture data
 */
import {
	ACTION_PLANS_RECEIVE,
	ACTION_PLANS_REQUEST,
	ACTION_PLANS_REQUEST_SUCCESS,
	ACTION_PLANS_REQUEST_FAILURE,
	WPCOM_RESPONSE as wpcomResponse,
	ERROR_MESSAGE_RESPONSE as errorResponse
} from './fixture';

describe( 'actions', () => {
	let sandbox, spy;

	useSandbox( newSandbox => {
		sandbox = newSandbox;
		spy = sandbox.spy();
	} );

	describe( 'creators functions', () => {
		it( '#plansReceiveAction()', () => {
			const plans = wpcomResponse;
			const action = plansReceiveAction( plans );
			expect( action ).to.eql( ACTION_PLANS_RECEIVE );
		} );

		it( '#plansRequestAction()', () => {
			const action = plansRequestAction();
			expect( action ).to.eql( ACTION_PLANS_REQUEST );
		} );

		it( '#plansRequestSuccessAction()', () => {
			const action = plansRequestSuccessAction();
			expect( action ).to.eql( ACTION_PLANS_REQUEST_SUCCESS );
		} );

		it( '#plansRequestFailureAction()', () => {
			const action = plansRequestFailureAction( errorResponse );
			expect( action ).to.eql( ACTION_PLANS_REQUEST_FAILURE );
		} );
	} );

	describe( '#requestPlans() - success', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.4/plans' )
				.reply( 200, wpcomResponse );
		} );

		it( 'should dispatch REQUEST action when thunk triggered', () => {
			const action = plansRequestAction();
			requestPlans()( spy );
			expect( spy ).to.have.been.calledWith( action );
		} );

		it( 'should dispatch RECEIVE action when request completes', () => {
			const plans = wpcomResponse;
			const action_request = plansRequestAction();
			const action_receive = plansReceiveAction( plans );
			const promise = requestPlans()( spy );

			expect( spy ).to.have.been.calledWith( action_request );

			return promise.then( () => {
				expect( spy ).to.have.been.calledWith( action_receive );
			} );
		} );
	} );
} );
