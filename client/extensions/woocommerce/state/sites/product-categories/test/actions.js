/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { fetchProductCategories } from '../actions';
import { WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST } from 'woocommerce/state/action-types';

describe( 'actions', () => {
	describe( '#fetchProductCategories()', () => {
		const siteId = '123';

		test( 'should dispatch an action', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			fetchProductCategories( siteId )( dispatch, getState );
			expect( dispatch ).to.have.been.calledWith( {
				type: WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST,
				siteId,
				query: {},
			} );
		} );
	} );
} );
