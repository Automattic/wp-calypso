/**
 * Internal dependencies
 */
import {
	secureYourBrandRequestAction,
	secureYourBrandSuccessAction,
	secureYourBrandFailureAction,
} from '../actions';
import {
	ACTION_SECURE_YOUR_BRAND_REQUEST,
	ACTION_SECURE_YOUR_BRAND_SUCCESS,
	ACTION_SECURE_YOUR_BRAND_FAILURE,
	WPCOM_RESPONSE as wpcomResponse,
	ERROR_MESSAGE_RESPONSE as errorResponse,
	SEARCH_DOMAIN as domain,
} from './fixture';

describe( 'actions', () => {
	describe( 'creators functions', () => {
		test( '#secureYourBrandSuccessAction()', () => {
			const secureYourBrand = wpcomResponse;
			const action = secureYourBrandSuccessAction( secureYourBrand );
			expect( action ).toEqual( ACTION_SECURE_YOUR_BRAND_SUCCESS );
		} );

		test( '#secureYourBrandFailureAction()', () => {
			const action = secureYourBrandFailureAction( errorResponse );
			expect( action ).toEqual( ACTION_SECURE_YOUR_BRAND_FAILURE );
		} );

		test( '#secureYourBrandRequestAction()', () => {
			expect( secureYourBrandRequestAction( domain ) ).toEqual( ACTION_SECURE_YOUR_BRAND_REQUEST );
		} );
	} );
} );
