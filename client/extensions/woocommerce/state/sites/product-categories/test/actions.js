/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import {
	fetchProductCategories,
	createProductCategory,
	updateProductCategory,
	deleteProductCategory,
} from '../actions';
import {
	WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST,
	WOOCOMMERCE_PRODUCT_CATEGORY_CREATE,
	WOOCOMMERCE_PRODUCT_CATEGORY_UPDATE,
	WOOCOMMERCE_PRODUCT_CATEGORY_DELETE,
} from 'woocommerce/state/action-types';

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
	describe( 'createProductCategory()', () => {
		const siteId = 123;
		const newCategory = {
			id: { placeholder: 'productcat_1' },
			name: 'Test',
			description: 'Test',
		};

		test( 'should dispatch an action', () => {
			const action = createProductCategory( siteId, newCategory, noop, noop );
			expect( action ).to.eql( {
				type: WOOCOMMERCE_PRODUCT_CATEGORY_CREATE,
				siteId: 123,
				category: newCategory,
				successAction: noop,
				failureAction: noop,
			} );
		} );
	} );
	describe( '#updateProductCategory()', () => {
		const siteId = 123;
		const updatedCategory = {
			id: 40,
			description: 'Updated',
		};

		test( 'should dispatch an action', () => {
			const action = updateProductCategory( siteId, updatedCategory, noop, noop );
			expect( action ).to.eql( {
				type: WOOCOMMERCE_PRODUCT_CATEGORY_UPDATE,
				siteId: 123,
				category: updatedCategory,
				successAction: noop,
				failureAction: noop,
			} );
		} );
	} );
	describe( '#deleteProductCategory()', () => {
		const siteId = 123;
		const category = {
			id: 40,
			name: 'Test',
			slug: 'test',
		};

		test( 'should dispatch an action', () => {
			const action = deleteProductCategory( siteId, category, noop, noop );
			expect( action ).to.eql( {
				type: WOOCOMMERCE_PRODUCT_CATEGORY_DELETE,
				siteId: 123,
				category,
				successAction: noop,
				failureAction: noop,
			} );
		} );
	} );
} );
