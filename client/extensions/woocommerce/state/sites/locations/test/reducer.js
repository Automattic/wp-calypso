/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import reducer from 'woocommerce/state/sites/reducer';
import { LOADING } from 'woocommerce/state/constants';
import {
	WOOCOMMERCE_LOCATIONS_REQUEST,
	WOOCOMMERCE_LOCATIONS_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';

describe( 'reducer', () => {
	it( 'should mark the locations tree as being "loading"', () => {
		const siteId = 123;
		const action = {
			type: WOOCOMMERCE_LOCATIONS_REQUEST,
			siteId,
		};

		const newSiteData = reducer( {}, action );
		expect( newSiteData[ siteId ].locations ).to.eql( LOADING );
	} );

	it( 'should store data from the action', () => {
		const siteId = 123;
		const locations = [
			{
				code: 'AF',
				name: 'Africa',
				countries: [
					{
						code: 'SA',
						name: 'South Africa',
						states: [],
					},
				],
			},
			{
				code: 'NA',
				name: 'North America',
				countries: [
					{
						code: 'US',
						name: 'United States',
						states: [
							{
								code: 'AL',
								name: 'Alabama',
							},
						],
					},
				],
			},
		];
		const action = {
			type: WOOCOMMERCE_LOCATIONS_REQUEST_SUCCESS,
			siteId,
			data: locations,
		};
		const newState = reducer( {}, action );
		expect( newState[ siteId ] ).to.exist;
		expect( newState[ siteId ].locations ).to.deep.equal( locations );
	} );
} );
