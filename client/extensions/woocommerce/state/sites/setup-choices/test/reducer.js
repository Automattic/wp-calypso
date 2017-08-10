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
	WOOCOMMERCE_SETUP_CHOICE_UPDATE_REQUEST_SUCCESS,
	WOOCOMMERCE_SETUP_CHOICES_REQUEST,
	WOOCOMMERCE_SETUP_CHOICES_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';

describe( 'reducers', () => {
	describe( '#WOOCOMMERCE_SETUP_CHOICES_REQUEST', () => {
		it( 'should mark the setup choices tree as "loading"', () => {
			const siteId = 123;
			const action = {
				type: WOOCOMMERCE_SETUP_CHOICES_REQUEST,
				siteId,
			};

			const newSiteData = reducer( {}, action );
			expect( newSiteData[ siteId ].setupChoices ).to.eql( LOADING );
		} );
	} );

	describe( '#WOOCOMMERCE_SETUP_CHOICES_REQUEST_SUCCESS', () => {
		it( 'should store data from the action', () => {
			const siteId = 123;
			const setupChoices = {
				finished_initial_setup: true,
				finished_page_setup: true,
				opted_out_of_shipping_setup: true,
				opted_out_of_taxes_setup: true,
				tried_customizer_during_initial_setup: true,
				created_default_shipping_zone: true,
				finished_initial_install_of_required_plugins: true,
				set_store_address_during_initial_setup: true,
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

	describe( '#WOOCOMMERCE_SETUP_CHOICE_UPDATE_REQUEST_SUCCESS', () => {
		it( 'should store data from the action', () => {
			const siteId = 123;
			const setupChoices = {
				finished_initial_setup: true,
				finished_page_setup: true,
				opted_out_of_shipping_setup: true,
				opted_out_of_taxes_setup: true,
				tried_customizer_during_initial_setup: true,
				created_default_shipping_zone: true,
				finished_initial_install_of_required_plugins: true,
				set_store_address_during_initial_setup: true,
			};
			const action = {
				type: WOOCOMMERCE_SETUP_CHOICE_UPDATE_REQUEST_SUCCESS,
				siteId,
				data: setupChoices,
			};
			const newState = reducer( {}, action );
			expect( newState[ siteId ] ).to.exist;
			expect( newState[ siteId ].setupChoices ).to.exist;
			expect( newState[ siteId ].setupChoices ).to.deep.equal( setupChoices );
		} );
	} );
} );
