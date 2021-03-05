/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import reducer from '../reducer';
import { WOOCOMMERCE_UI_REVIEWS_SET_QUERY } from 'woocommerce/state/action-types';

describe( 'reducer', () => {
	test( 'should store the current query', () => {
		const action = {
			type: WOOCOMMERCE_UI_REVIEWS_SET_QUERY,
			siteId: 123,
			query: {
				page: 2,
			},
		};
		const newState = reducer( undefined, action );
		expect( newState ).to.eql( { currentPage: 2, currentSearch: '', currentProduct: null } );
	} );

	test( 'should update the current page when changed', () => {
		const action = {
			type: WOOCOMMERCE_UI_REVIEWS_SET_QUERY,
			siteId: 123,
			query: {
				page: 2,
			},
		};
		const originalState = deepFreeze( { currentPage: 3, currentSearch: '' } );
		const newState = reducer( originalState, action );
		expect( newState ).to.eql( { currentPage: 2, currentSearch: '', currentProduct: null } );
	} );

	test( 'should update the current search when changed', () => {
		const action = {
			type: WOOCOMMERCE_UI_REVIEWS_SET_QUERY,
			siteId: 123,
			query: {
				search: 'testing',
			},
		};
		const originalState = deepFreeze( { currentPage: 3, currentSearch: '' } );
		const newState = reducer( originalState, action );
		expect( newState ).to.eql( { currentPage: 3, currentSearch: 'testing', currentProduct: null } );
	} );

	test( 'should update the current product when changed', () => {
		const action = {
			type: WOOCOMMERCE_UI_REVIEWS_SET_QUERY,
			siteId: 123,
			query: {
				product: 50,
			},
		};
		const originalState = deepFreeze( { currentPage: 3, currentSearch: '' } );
		const newState = reducer( originalState, action );
		expect( newState ).to.eql( { currentPage: 3, currentSearch: '', currentProduct: 50 } );
	} );
} );
