/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy, match } from 'sinon';

/**
 * Internal dependencies
 */
import { createProductCategory, productCategoryUpdated } from 'woocommerce/state/sites/product-categories/actions';
import { handleProductCategoryCreate, handleProductCategoryUpdated } from '../';
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
					onSuccessAction: productCategoryUpdated( 123, null, successAction ),
					onFailureAction: failureAction,
					body: { name: 'Category 1', slug: 'category-1' },
				} )
			);
		} );
	} );

	describe( '#handleProductUpdated', () => {
		it( 'should dispatch a completion action', () => {
			const store = {
				dispatch: spy(),
			};

			const category1 = { id: 101, name: 'Newly Created Category' };
			const completionAction = { type: '%%complete%%' };
			const action = productCategoryUpdated( 123, category1, completionAction );

			handleProductCategoryUpdated( store, action );

			expect( store.dispatch ).to.have.been.calledWith( completionAction );
		} );
	} );
} );
