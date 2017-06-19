/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy, match } from 'sinon';

/**
 * Internal dependencies
 */
import { createProductCategory } from 'woocommerce/state/sites/product-categories/actions';
import { handleProductCategoryCreate } from '../';
import {
	WOOCOMMERCE_API_REQUEST,
} from 'woocommerce/state/action-types';

describe( 'handlers', () => {
	describe( '#handleProductCategoryCreate', () => {
		it( 'should dispatch a post action', () => {
			const store = {
				dispatch: spy(),
			};

			const category1 = { id: { index: 0 }, name: 'Category 1', slug: 'category-1' };
			const successAction = { type: '%%success%%' };
			const failureAction = { type: '%%failure%%' };
			const action = createProductCategory( 123, category1, successAction, failureAction );

			handleProductCategoryCreate( store, action );

			expect( store.dispatch ).to.have.been.calledWith(
				match( {
					type: WOOCOMMERCE_API_REQUEST,
					method: 'post',
					siteId: 123,
					onSuccessAction: successAction,
					onFailureAction: failureAction,
					body: { name: 'Category 1', slug: 'category-1' },
				} )
			);
		} );
	} );
} );
