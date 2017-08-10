/** @format */
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
import { WOOCOMMERCE_API_REQUEST } from 'woocommerce/state/action-types';

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
					body: { name: 'Category 1', slug: 'category-1' },
					onFailureAction: failureAction,
				} ).and( match.has( 'onSuccessAction' ) )
			);
		} );

		it( 'should dispatch a success action with extra properties', () => {
			const store = {
				dispatch: spy(),
			};

			const category1 = { id: { placeholder: 'p1' }, name: 'Category 1', slug: 'category-1' };
			const successAction = { type: '%%success%%' };
			const action = createProductCategory( 123, category1, successAction );

			handleProductCategoryCreate( store, action );

			expect( store.dispatch ).to.have.been.calledWith(
				match( {
					type: WOOCOMMERCE_API_REQUEST,
					method: 'post',
					siteId: 123,
					body: { name: 'Category 1', slug: 'category-1' },
				} )
			);

			const updatedSuccessAction = store.dispatch.firstCall.args[ 0 ].onSuccessAction;
			expect( updatedSuccessAction ).to.be.a( 'function' );

			updatedSuccessAction( store.dispatch, null, { data: 'RECEIVED_DATA' } );

			expect( store.dispatch ).to.have.been.calledWith(
				match( {
					type: '%%success%%',
					sentData: category1,
					receivedData: 'RECEIVED_DATA',
				} )
			);
		} );

		it( 'should dispatch a success function with extra parameters', () => {
			const store = {
				dispatch: spy(),
			};

			const category1 = { id: { placeholder: 'p1' }, name: 'Category 1', slug: 'category-1' };
			const successAction = ( dispatch, getState, { sentData, receivedData } ) => {
				return { type: '%%success%%', sentData, receivedData };
			};
			const action = createProductCategory( 123, category1, successAction );

			handleProductCategoryCreate( store, action );

			expect( store.dispatch ).to.have.been.calledWith(
				match( {
					type: WOOCOMMERCE_API_REQUEST,
					method: 'post',
					siteId: 123,
					body: { name: 'Category 1', slug: 'category-1' },
				} )
			);

			const updatedSuccessAction = store.dispatch.firstCall.args[ 0 ].onSuccessAction;
			expect( updatedSuccessAction ).to.be.a( 'function' );

			updatedSuccessAction( store.dispatch, null, { data: 'RECEIVED_DATA' } );

			expect( store.dispatch ).to.have.been.calledWith(
				match( {
					type: '%%success%%',
					sentData: category1,
					receivedData: 'RECEIVED_DATA',
				} )
			);
		} );
	} );
} );
