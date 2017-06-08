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
	WOOCOMMERCE_SETUP_CHOICES_REQUEST,
	WOOCOMMERCE_SETUP_CHOICES_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';

describe( 'reducer', () => {
	it( 'should mark the setup choices tree as "loading"', () => {
		const siteId = 123;
		const action = {
			type: WOOCOMMERCE_SETUP_CHOICES_REQUEST,
			siteId,
		};

		const newSiteData = reducer( {}, action );
		expect( newSiteData[ siteId ].setupChoices ).to.eql( LOADING );
	} );

	it( 'should store data from the action', () => {
		const siteId = 123;
		const setupChoices = {
			finished_initial_setup: true,
			opted_out_of_shipping_setup: true,
			opted_out_of_taxes_setup: true,
			tried_customizer_during_initial_setup: true,
		};
		const action = {
			type: WOOCOMMERCE_SETUP_CHOICES_REQUEST_SUCCESS,
			siteId,
			data: setupChoices,
		};
		const newState = reducer( {}, action );
		expect( newState[ siteId ] ).to.exist;
		expect( newState[ siteId ].setupChoices ).to.exist;
		expect( newState[ siteId ].setupChoices ).to.deep.equal( setupChoices );
	} );
} );
