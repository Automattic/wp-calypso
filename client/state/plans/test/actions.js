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
} from '../actions';

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
} );
