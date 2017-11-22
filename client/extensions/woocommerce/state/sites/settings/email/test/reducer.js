/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_EMAIL_SETTINGS_REQUEST,
	WOOCOMMERCE_EMAIL_SETTINGS_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';
import { LOADING } from 'woocommerce/state/constants';
import reducer from 'woocommerce/state/sites/reducer';

describe( 'reducer', () => {
	test( 'should mark the email settings tree as "loading"', () => {
		const siteId = 123;
		const action = {
			type: WOOCOMMERCE_EMAIL_SETTINGS_REQUEST,
			siteId,
		};

		const newSiteData = reducer( {}, action );
		expect( newSiteData[ siteId ].settings.email ).to.eql( LOADING );
	} );

	test( 'should store data from the action', () => {
		const siteId = 123;
		const settings = [
			{
				id: 'woocommerce_email_from_name',
				value: '',
				group_id: 'email',
			},
			{
				id: 'woocommerce_email_from_address',
				value: 'test@test.com',
				group_id: 'email',
			},
			{
				id: 'enabled',
				value: 'yes',
				group_id: 'email_new_order',
			},
			{
				id: 'recipient',
				value: 'admin_1@test.com',
				group_id: 'email_new_order',
			},
		];

		const expectedResult = {
			email: {
				woocommerce_email_from_name: '',
				woocommerce_email_from_address: 'test@test.com',
			},
			email_new_order: {
				enabled: 'yes',
				recipient: 'admin_1@test.com',
			},
		};

		const action = {
			type: WOOCOMMERCE_EMAIL_SETTINGS_REQUEST_SUCCESS,
			siteId,
			data: settings,
		};

		const newState = reducer( {}, action );
		expect( newState[ siteId ] ).to.exist;
		expect( newState[ siteId ].settings ).to.exist;
		expect( newState[ siteId ].settings.email ).to.deep.equal( expectedResult );
	} );
} );
