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
	test( 'should store the current query for more than one site', () => {
		const action = {
			type: WOOCOMMERCE_UI_REVIEWS_SET_QUERY,
			siteId: 234,
			query: {
				search: 'testing',
			},
		};
		const originalState = deepFreeze( {
			123: { list: { currentPage: 3, currentSearch: '', currentProduct: null } },
		} );
		const newState = reducer( originalState, action );
		expect( newState ).to.eql( {
			123: { list: { currentPage: 3, currentSearch: '', currentProduct: null } },
			234: { list: { currentPage: 1, currentSearch: 'testing', currentProduct: null } },
		} );
	} );
} );
