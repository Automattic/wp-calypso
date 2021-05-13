/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	plansReceiveAction,
	plansRequestSuccessAction,
	plansRequestFailureAction,
	requestPlans,
} from '../actions';
import {
	ACTION_PLANS_RECEIVE,
	ACTION_PLANS_REQUEST,
	ACTION_PLANS_REQUEST_SUCCESS,
	ACTION_PLANS_REQUEST_FAILURE,
	WPCOM_RESPONSE as wpcomResponse,
	ERROR_MESSAGE_RESPONSE as errorResponse,
} from './fixture';

describe( 'actions', () => {
	describe( 'creators functions', () => {
		test( '#plansReceiveAction()', () => {
			const plans = wpcomResponse;
			const action = plansReceiveAction( plans );
			expect( action ).to.eql( ACTION_PLANS_RECEIVE );
		} );

		test( '#plansRequestSuccessAction()', () => {
			const action = plansRequestSuccessAction();
			expect( action ).to.eql( ACTION_PLANS_REQUEST_SUCCESS );
		} );

		test( '#plansRequestFailureAction()', () => {
			const action = plansRequestFailureAction( errorResponse );
			expect( action ).to.eql( ACTION_PLANS_REQUEST_FAILURE );
		} );

		test( '#requestPlans()', () => {
			expect( requestPlans() ).to.eql( ACTION_PLANS_REQUEST );
		} );
	} );
} );
