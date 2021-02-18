/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_COUNT_REQUEST,
	WOOCOMMERCE_COUNT_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';
import reducer from 'woocommerce/state/sites/reducer';

describe( 'reducer', () => {
	test( 'should mark the counts as being "loading"', () => {
		const siteId = 123;
		const action = {
			type: WOOCOMMERCE_COUNT_REQUEST,
			siteId,
		};

		const newSiteData = reducer( {}, action );
		expect( newSiteData[ siteId ].data.counts.isLoading ).to.be.true;
	} );

	test( 'should store data from the action', () => {
		const siteId = 123;
		const counts = {
			orders: {
				'wc-pending': 0,
				'wc-processing': 1,
				'wc-on-hold': 0,
				'wc-completed': 1,
			},
			products: {
				all: 5,
			},
			reviews: {
				approved: 1,
				awaiting_moderation: 1,
			},
		};
		const action = {
			type: WOOCOMMERCE_COUNT_REQUEST_SUCCESS,
			siteId,
			counts,
		};
		const newState = reducer( {}, action );
		expect( newState[ siteId ] ).to.exist;
		expect( newState[ siteId ].data.counts.items ).to.deep.equal( counts );
	} );
} );
