/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_MAILCHIMP_API_KEY_SUBMIT_FAILURE,
	WOOCOMMERCE_MAILCHIMP_API_KEY_SUBMIT_SUCCESS,
	WOOCOMMERCE_MAILCHIMP_API_KEY_SUBMIT,
	WOOCOMMERCE_MAILCHIMP_LISTS_REQUEST_SUCCESS,
	WOOCOMMERCE_MAILCHIMP_NEWSLETTER_SETTINGS_SUBMIT_SUCCESS,
	WOOCOMMERCE_MAILCHIMP_SAVE_SETTINGS,
	WOOCOMMERCE_MAILCHIMP_SETTINGS_REQUEST_FAILURE,
	WOOCOMMERCE_MAILCHIMP_SETTINGS_REQUEST_SUCCESS,
	WOOCOMMERCE_MAILCHIMP_SETTINGS_REQUEST,
} from 'woocommerce/state/action-types';
import reducer from 'woocommerce/state/sites/reducer';

describe( 'reducer', () => {
	test( 'should mark the settings request fetching', () => {
		const siteId = 123;
		const action = {
			type: WOOCOMMERCE_MAILCHIMP_SETTINGS_REQUEST,
			siteId,
		};

		const newSiteData = reducer( {}, action );
		expect( newSiteData[ siteId ].settings.mailchimp.settingsRequest ).to.eql( true );
	} );

	test( 'should store data from the action', () => {
		const siteId = 123;
		const settings = { store_name: 'mystore' };
		const action = {
			type: WOOCOMMERCE_MAILCHIMP_SETTINGS_REQUEST_SUCCESS,
			siteId,
			settings,
		};
		const newState = reducer( {}, action );
		expect( newState[ siteId ] ).to.exist;
		expect( newState[ siteId ].settings ).to.exist;
		expect( newState[ siteId ].settings.mailchimp.settings ).to.deep.equal( settings );
	} );

	test( 'should merge lists data into settings and pick first as default if none is chosen', () => {
		const siteId = 123;
		const settings = { store_name: 'mystore' };
		const lists = { a: 'list_a', b: 'list_b' };
		const settingsAction = {
			type: WOOCOMMERCE_MAILCHIMP_SETTINGS_REQUEST_SUCCESS,
			siteId,
			settings,
		};

		const listsAction = {
			type: WOOCOMMERCE_MAILCHIMP_LISTS_REQUEST_SUCCESS,
			siteId,
			lists,
		};

		const finalState = {
			store_name: 'mystore',
			mailchimp_lists: {
				a: 'list_a',
				b: 'list_b',
			},
			mailchimp_list: 'a',
		};

		const firstState = reducer( {}, settingsAction );
		const updatedState = reducer( firstState, listsAction );
		expect( updatedState[ siteId ] ).to.exist;
		expect( updatedState[ siteId ].settings ).to.exist;
		expect( updatedState[ siteId ].settings.mailchimp.settings ).to.deep.equal( finalState );
	} );

	test( 'should merge lists data into settings and not update the chosen list when a list has been selected', () => {
		const siteId = 123;
		const settings = { store_name: 'mystore', mailchimp_list: 'c' };
		const lists = { a: 'list_a', b: 'list_b' };
		const settingsAction = {
			type: WOOCOMMERCE_MAILCHIMP_SETTINGS_REQUEST_SUCCESS,
			siteId,
			settings,
		};

		const listsAction = {
			type: WOOCOMMERCE_MAILCHIMP_LISTS_REQUEST_SUCCESS,
			siteId,
			lists,
		};

		const finalState = {
			store_name: 'mystore',
			mailchimp_lists: {
				a: 'list_a',
				b: 'list_b',
			},
			mailchimp_list: 'c',
		};

		const firstState = reducer( {}, settingsAction );
		const updatedState = reducer( firstState, listsAction );
		expect( updatedState[ siteId ] ).to.exist;
		expect( updatedState[ siteId ].settings ).to.exist;
		expect( updatedState[ siteId ].settings.mailchimp.settings ).to.deep.equal( finalState );
	} );

	test( 'success after failure should cancel failure indication for settings request', () => {
		const siteId = 123;
		const settings = { store_name: 'mystore', mailchimp_list: 'c' };
		const error = { error: 'no_route_to_host' };

		const settingsRequestError = {
			type: WOOCOMMERCE_MAILCHIMP_SETTINGS_REQUEST_FAILURE,
			siteId,
			error,
		};

		const settingsSuccessAction = {
			type: WOOCOMMERCE_MAILCHIMP_SETTINGS_REQUEST_SUCCESS,
			siteId,
			settings,
		};

		const firstState = reducer( {}, settingsRequestError );
		expect( firstState[ siteId ] ).to.exist;
		expect( firstState[ siteId ].settings ).to.exist;
		expect( firstState[ siteId ].settings.mailchimp.settingsRequestError ).to.deep.equal( error );

		const updatedState = reducer( firstState, settingsSuccessAction );
		expect( updatedState[ siteId ] ).to.exist;
		expect( updatedState[ siteId ].settings ).to.exist;
		expect( updatedState[ siteId ].settings.mailchimp.settingsRequestError ).to.equal( false );
	} );

	test( 'should mark submit request as submitting', () => {
		const siteId = 123;
		const action = {
			type: WOOCOMMERCE_MAILCHIMP_API_KEY_SUBMIT,
			siteId,
		};

		const newSiteData = reducer( {}, action );
		expect( newSiteData[ siteId ].settings.mailchimp.apiKeySubmit ).to.eql( true );
	} );

	test( 'should mark submit request as false after submit success', () => {
		const siteId = 123;
		const action = {
			type: WOOCOMMERCE_MAILCHIMP_API_KEY_SUBMIT,
			siteId,
		};

		const secondAction = {
			type: WOOCOMMERCE_MAILCHIMP_API_KEY_SUBMIT_SUCCESS,
			siteId,
			settings: { store_name: 'store' },
		};

		const newSiteData = reducer( {}, action );
		const updatedState = reducer( newSiteData, secondAction );
		expect( updatedState[ siteId ].settings.mailchimp.apiKeySubmit ).to.eql( false );
	} );

	test( 'should mark submit request as false after submit error', () => {
		const siteId = 123;
		const action = {
			type: WOOCOMMERCE_MAILCHIMP_API_KEY_SUBMIT,
			siteId,
		};

		const secondAction = {
			type: WOOCOMMERCE_MAILCHIMP_API_KEY_SUBMIT_FAILURE,
			siteId,
			error: { status: 'no_route_to_host' },
		};

		const newSiteData = reducer( {}, action );
		const updatedState = reducer( newSiteData, secondAction );
		expect( updatedState[ siteId ].settings.mailchimp.apiKeySubmit ).to.eql( false );
	} );

	test( 'should mark saveSettings as true after dispatching mailChimpSaveSettings', () => {
		const siteId = 123;
		const action = {
			type: WOOCOMMERCE_MAILCHIMP_SAVE_SETTINGS,
			siteId,
		};

		const newState = reducer( {}, action );
		expect( newState[ siteId ].settings.mailchimp.saveSettings ).to.eql( true );
	} );

	test( 'should mark saveSettings as false after newsletter settings submit success', () => {
		const siteId = 123;
		const action = {
			type: WOOCOMMERCE_MAILCHIMP_SAVE_SETTINGS,
			siteId,
		};

		const secondAction = {
			type: WOOCOMMERCE_MAILCHIMP_NEWSLETTER_SETTINGS_SUBMIT_SUCCESS,
			siteId,
			settings: { mailchimp_list: 'woot' },
		};

		const newSiteData = reducer( {}, action );
		const updatedState = reducer( newSiteData, secondAction );
		expect( updatedState[ siteId ].settings.mailchimp.saveSettings ).to.eql( false );
	} );
} );
