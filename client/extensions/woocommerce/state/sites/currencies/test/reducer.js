/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_CURRENCIES_REQUEST,
	WOOCOMMERCE_CURRENCIES_REQUEST_SUCCESS,
} from 'client/extensions/woocommerce/state/action-types';
import { LOADING } from 'client/extensions/woocommerce/state/constants';
import reducer from 'client/extensions/woocommerce/state/sites/reducer';

describe( 'reducer', () => {
	test( 'should mark the currencies array as being "loading"', () => {
		const siteId = 123;
		const action = {
			type: WOOCOMMERCE_CURRENCIES_REQUEST,
			siteId,
		};

		const newSiteData = reducer( {}, action );
		expect( newSiteData[ siteId ].currencies ).to.eql( LOADING );
	} );

	test( 'should store data from the action', () => {
		const siteId = 123;
		const currencies = [
			{ code: 'AED', name: 'United Arab Emirates dirham', symbol: '&#x62f;.&#x625;' },
			{ code: 'AFN', name: 'Afghan afghani', symbol: '&#x60b;' },
		];
		const action = {
			type: WOOCOMMERCE_CURRENCIES_REQUEST_SUCCESS,
			siteId,
			data: currencies,
		};
		const newState = reducer( {}, action );
		expect( newState[ siteId ] ).to.exist;
		expect( newState[ siteId ].currencies ).to.deep.equal( currencies );
	} );
} );
