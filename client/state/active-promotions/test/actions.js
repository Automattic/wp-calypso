/**
 * Internal dependencies
 */
import {
	activePromotionsReceiveAction,
	activePromotionsRequestSuccessAction,
	activePromotionsRequestFailureAction,
	requestActivePromotions,
} from '../actions';
import {
	ACTION_ACTIVE_PROMOTIONS_RECEIVE,
	ACTION_ACTIVE_PROMOTIONS_REQUEST,
	ACTION_ACTIVE_PROMOTIONS_REQUEST_SUCCESS,
	ACTION_ACTIVE_PROMOTIONS_REQUEST_FAILURE,
	WPCOM_RESPONSE as wpcomResponse,
	ERROR_MESSAGE_RESPONSE as errorResponse,
} from './fixture';

describe( 'actions', () => {
	describe( 'creators functions', () => {
		test( '#activePromotionsReceiveAction()', () => {
			const activePromotions = wpcomResponse;
			const action = activePromotionsReceiveAction( activePromotions );
			expect( action ).toEqual( ACTION_ACTIVE_PROMOTIONS_RECEIVE );
		} );

		test( '#activePromotionsRequestSuccessAction()', () => {
			const action = activePromotionsRequestSuccessAction();
			expect( action ).toEqual( ACTION_ACTIVE_PROMOTIONS_REQUEST_SUCCESS );
		} );

		test( '#activePromotionsRequestFailureAction()', () => {
			const action = activePromotionsRequestFailureAction( errorResponse );
			expect( action ).toEqual( ACTION_ACTIVE_PROMOTIONS_REQUEST_FAILURE );
		} );

		test( '#requestActivePromotions()', () => {
			expect( requestActivePromotions() ).toEqual( ACTION_ACTIVE_PROMOTIONS_REQUEST );
		} );
	} );
} );
