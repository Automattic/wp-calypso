/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';
import { set } from 'lodash';

/**
 * Internal dependencies
 */
import { requestCategories, requestCategoriesSuccess } from '../handlers';
import { fetchProductCategories } from '../actions';
import request from 'woocommerce/state/sites/http-request';

describe( 'handlers', () => {
	const siteId = 123;
	const noopStore = {
		dispatch: () => {},
	};
	const noopNext = () => {};

	describe( '#requestCategories', () => {
		it( 'should dispatch a request and call next', () => {
			const store = {
				dispatch: spy(),
			};
			const action = fetchProductCategories( siteId );
			const req = request( siteId, action ).get( 'products/categories' );

			requestCategories( store, action, noopNext );

			expect( store.dispatch ).to.have.been.calledWith( req );
		} );

		it( 'should call next', () => {
			const next = spy();
			const action = fetchProductCategories( siteId );
			const result = requestCategories( noopStore, action, next );
			expect( next ).to.have.been.calledWith( action );
			expect( result ).to.equal( next.returnValues[ 0 ] );
		} );
	} );

	describe( '#requestCategoriesSuccess', () => {
		it( 'should not set error on valid category data', () => {
			const validCategories = [
				{ id: 1, name: 'Category 1', slug: 'cat-1' },
				{ id: 2, name: 'Category 2', slug: 'cat-2' },
				{ id: 3, name: 'Category 3', slug: 'cat-3' },
			];

			const action = fetchProductCategories( siteId );
			set( action, [ 'meta', 'dataLayer', 'data' ], { data: validCategories } );
			requestCategoriesSuccess( noopStore, action, noopNext, { data: validCategories } );

			expect( action.meta.dataLayer.error ).to.not.exist;
		} );

		it( 'should set error with message if an id is missing', () => {
			const invalidCategories = [
				{ name: 'No ID', slug: 'no-id' },
			];

			const action = fetchProductCategories( siteId );
			set( action, [ 'meta', 'dataLayer', 'data' ], { data: invalidCategories } );
			requestCategoriesSuccess( noopStore, action, noopNext, { data: invalidCategories } );

			expect( action.meta.dataLayer.error ).to.exist;
			expect( action.meta.dataLayer.error.message ).to.exist;
		} );

		it( 'should set error with message if a name is missing', () => {
			const invalidCategories = [
				{ id: 1, slug: 'no-name' },
			];

			const action = fetchProductCategories( siteId );
			set( action, [ 'meta', 'dataLayer', 'data' ], { data: invalidCategories } );
			requestCategoriesSuccess( noopStore, action, noopNext, { data: invalidCategories } );

			expect( action.meta.dataLayer.error ).to.exist;
			expect( action.meta.dataLayer.error.message ).to.exist;
		} );

		it( 'should set error with message if a slug is missing', () => {
			const invalidCategories = [
				{ id: 1, name: 'No Slug' },
			];

			const action = fetchProductCategories( siteId );
			set( action, [ 'meta', 'dataLayer', 'data' ], { data: invalidCategories } );
			requestCategoriesSuccess( noopStore, action, noopNext, { data: invalidCategories } );

			expect( action.meta.dataLayer.error ).to.exist;
			expect( action.meta.dataLayer.error.message ).to.exist;
		} );

		it( 'should call next', () => {
			const next = spy();
			const action = fetchProductCategories( siteId );
			const result = requestCategoriesSuccess( noopStore, action, next, { data: {} } );
			expect( next ).to.have.been.calledWith( action );
			expect( result ).to.equal( next.returnValues[ 0 ] );
		} );
	} );
} );

