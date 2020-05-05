/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import {
	fetchSetupChoices,
	setCheckedTaxSetup,
	setFinishedInitialSetup,
	setFinishedInstallOfRequiredPlugins,
	setOptedOutOfShippingSetup,
	setOptedOutOfTaxesSetup,
	setSetStoreAddressDuringInitialSetup,
	setTriedCustomizerDuringInitialSetup,
	setCreatedDefaultShippingZone,
	setUpStorePages,
} from '../actions';
import useNock from 'test/helpers/use-nock';
import {
	WOOCOMMERCE_SETUP_CHOICE_UPDATE_REQUEST,
	WOOCOMMERCE_SETUP_CHOICE_UPDATE_REQUEST_SUCCESS,
	WOOCOMMERCE_SETUP_CHOICES_REQUEST,
	WOOCOMMERCE_SETUP_CHOICES_REQUEST_SUCCESS,
	WOOCOMMERCE_SETUP_STORE_PAGES_REQUEST,
} from 'woocommerce/state/action-types';
import { LOADING } from 'woocommerce/state/constants';

describe( 'actions', () => {
	describe( '#fetchSetupChoices()', () => {
		const siteId = '123';

		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/sites/123/calypso-preferences/woocommerce' )
				.reply( 200, {
					finished_initial_setup: true,
					opted_out_of_shipping_setup: true,
					opted_out_of_taxes_setup: true,
					tried_customizer_during_initial_setup: true,
					created_default_shipping_zone: true,
					finished_initial_install_of_required_plugins: true,
					set_store_address_during_initial_setup: true,
				} );
		} );

		test( 'should dispatch an action', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			fetchSetupChoices( siteId )( dispatch, getState );
			expect( dispatch ).to.have.been.calledWith( {
				type: WOOCOMMERCE_SETUP_CHOICES_REQUEST,
				siteId,
			} );
		} );

		test( 'should dispatch a success action with setup choices when request completes', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const response = fetchSetupChoices( siteId )( dispatch, getState );

			return response.then( () => {
				expect( dispatch ).to.have.been.calledWith( {
					type: WOOCOMMERCE_SETUP_CHOICES_REQUEST_SUCCESS,
					siteId,
					data: {
						finished_initial_setup: true,
						opted_out_of_shipping_setup: true,
						opted_out_of_taxes_setup: true,
						tried_customizer_during_initial_setup: true,
						created_default_shipping_zone: true,
						finished_initial_install_of_required_plugins: true,
						set_store_address_during_initial_setup: true,
					},
				} );
			} );
		} );

		test( 'should not dispatch if setup choices are already loading for this site', () => {
			const getState = () => ( {
				extensions: {
					woocommerce: {
						sites: {
							[ siteId ]: {
								setupChoices: LOADING,
							},
						},
					},
				},
			} );
			const dispatch = spy();
			fetchSetupChoices( siteId )( dispatch, getState );
			expect( dispatch ).to.not.have.been.called;
		} );
	} );

	describe( '#setFinishedInitialSetup', () => {
		const siteId = '123';

		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/sites/123/calypso-preferences/woocommerce', {
					finished_initial_setup: true,
				} )
				.reply( 200, {
					finished_initial_setup: true,
					opted_out_of_shipping_setup: false,
					opted_out_of_taxes_setup: false,
					tried_customizer_during_initial_setup: false,
					created_default_shipping_zone: false,
					finished_initial_install_of_required_plugins: false,
					set_store_address_during_initial_setup: false,
				} );
		} );

		test( 'should dispatch an action', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			setFinishedInitialSetup( siteId, true )( dispatch, getState );
			expect( dispatch ).to.have.been.calledWith( {
				type: WOOCOMMERCE_SETUP_CHOICE_UPDATE_REQUEST,
				siteId,
				key: 'finished_initial_setup',
				value: true,
			} );
		} );

		test( 'should dispatch a success action with setup choices when request completes', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const response = setFinishedInitialSetup( siteId, true )( dispatch, getState );

			return response.then( () => {
				expect( dispatch ).to.have.been.calledWith( {
					type: WOOCOMMERCE_SETUP_CHOICE_UPDATE_REQUEST_SUCCESS,
					siteId,
					data: {
						finished_initial_setup: true,
						opted_out_of_shipping_setup: false,
						opted_out_of_taxes_setup: false,
						tried_customizer_during_initial_setup: false,
						created_default_shipping_zone: false,
						finished_initial_install_of_required_plugins: false,
						set_store_address_during_initial_setup: false,
					},
				} );
			} );
		} );
	} );

	describe( '#setOptedOutOfShippingSetup', () => {
		const siteId = '123';

		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/sites/123/calypso-preferences/woocommerce', {
					opted_out_of_shipping_setup: true,
				} )
				.reply( 200, {
					finished_initial_setup: false,
					opted_out_of_shipping_setup: true,
					opted_out_of_taxes_setup: false,
					tried_customizer_during_initial_setup: false,
					created_default_shipping_zone: false,
					finished_initial_install_of_required_plugins: false,
					set_store_address_during_initial_setup: false,
				} );
		} );

		test( 'should dispatch an action', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			setOptedOutOfShippingSetup( siteId, true )( dispatch, getState );
			expect( dispatch ).to.have.been.calledWith( {
				type: WOOCOMMERCE_SETUP_CHOICE_UPDATE_REQUEST,
				siteId,
				key: 'opted_out_of_shipping_setup',
				value: true,
			} );
		} );

		test( 'should dispatch a success action with setup choices when request completes', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const response = setOptedOutOfShippingSetup( siteId, true )( dispatch, getState );

			return response.then( () => {
				expect( dispatch ).to.have.been.calledWith( {
					type: WOOCOMMERCE_SETUP_CHOICE_UPDATE_REQUEST_SUCCESS,
					siteId,
					data: {
						finished_initial_setup: false,
						opted_out_of_shipping_setup: true,
						opted_out_of_taxes_setup: false,
						tried_customizer_during_initial_setup: false,
						created_default_shipping_zone: false,
						finished_initial_install_of_required_plugins: false,
						set_store_address_during_initial_setup: false,
					},
				} );
			} );
		} );
	} );

	describe( '#setOptedOutOfTaxesSetup', () => {
		const siteId = '123';

		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/sites/123/calypso-preferences/woocommerce', {
					opted_out_of_taxes_setup: true,
				} )
				.reply( 200, {
					finished_initial_setup: false,
					opted_out_of_shipping_setup: false,
					opted_out_of_taxes_setup: true,
					tried_customizer_during_initial_setup: false,
					created_default_shipping_zone: false,
					finished_initial_install_of_required_plugins: false,
					set_store_address_during_initial_setup: false,
				} );
		} );

		test( 'should dispatch an action', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			setOptedOutOfTaxesSetup( siteId, true )( dispatch, getState );
			expect( dispatch ).to.have.been.calledWith( {
				type: WOOCOMMERCE_SETUP_CHOICE_UPDATE_REQUEST,
				siteId,
				key: 'opted_out_of_taxes_setup',
				value: true,
			} );
		} );

		test( 'should dispatch a success action with setup choices when request completes', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const response = setOptedOutOfTaxesSetup( siteId, true )( dispatch, getState );

			return response.then( () => {
				expect( dispatch ).to.have.been.calledWith( {
					type: WOOCOMMERCE_SETUP_CHOICE_UPDATE_REQUEST_SUCCESS,
					siteId,
					data: {
						finished_initial_setup: false,
						opted_out_of_shipping_setup: false,
						opted_out_of_taxes_setup: true,
						tried_customizer_during_initial_setup: false,
						created_default_shipping_zone: false,
						finished_initial_install_of_required_plugins: false,
						set_store_address_during_initial_setup: false,
					},
				} );
			} );
		} );
	} );

	describe( '#setTriedCustomizerDuringInitialSetup', () => {
		const siteId = '123';

		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/sites/123/calypso-preferences/woocommerce', {
					tried_customizer_during_initial_setup: true,
				} )
				.reply( 200, {
					finished_initial_setup: false,
					opted_out_of_shipping_setup: false,
					opted_out_of_taxes_setup: false,
					tried_customizer_during_initial_setup: true,
					created_default_shipping_zone: false,
					finished_initial_install_of_required_plugins: false,
					set_store_address_during_initial_setup: false,
				} );
		} );

		test( 'should dispatch an action', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			setTriedCustomizerDuringInitialSetup( siteId, true )( dispatch, getState );
			expect( dispatch ).to.have.been.calledWith( {
				type: WOOCOMMERCE_SETUP_CHOICE_UPDATE_REQUEST,
				siteId,
				key: 'tried_customizer_during_initial_setup',
				value: true,
			} );
		} );

		test( 'should dispatch a success action with setup choices when request completes', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const response = setTriedCustomizerDuringInitialSetup( siteId, true )( dispatch, getState );

			return response.then( () => {
				expect( dispatch ).to.have.been.calledWith( {
					type: WOOCOMMERCE_SETUP_CHOICE_UPDATE_REQUEST_SUCCESS,
					siteId,
					data: {
						finished_initial_setup: false,
						opted_out_of_shipping_setup: false,
						opted_out_of_taxes_setup: false,
						tried_customizer_during_initial_setup: true,
						created_default_shipping_zone: false,
						finished_initial_install_of_required_plugins: false,
						set_store_address_during_initial_setup: false,
					},
				} );
			} );
		} );
	} );

	describe( '#setCreatedDefaultShippingZone', () => {
		const siteId = '123';

		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/sites/123/calypso-preferences/woocommerce', {
					created_default_shipping_zone: true,
				} )
				.reply( 200, {
					finished_initial_setup: false,
					opted_out_of_shipping_setup: false,
					opted_out_of_taxes_setup: false,
					tried_customizer_during_initial_setup: false,
					created_default_shipping_zone: true,
					finished_initial_install_of_required_plugins: false,
					set_store_address_during_initial_setup: false,
				} );
		} );

		test( 'should dispatch an action', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			setCreatedDefaultShippingZone( siteId, true )( dispatch, getState );
			expect( dispatch ).to.have.been.calledWith( {
				type: WOOCOMMERCE_SETUP_CHOICE_UPDATE_REQUEST,
				siteId,
				key: 'created_default_shipping_zone',
				value: true,
			} );
		} );

		test( 'should dispatch a success action with setup choices when request completes', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const response = setCreatedDefaultShippingZone( siteId, true )( dispatch, getState );

			return response.then( () => {
				expect( dispatch ).to.have.been.calledWith( {
					type: WOOCOMMERCE_SETUP_CHOICE_UPDATE_REQUEST_SUCCESS,
					siteId,
					data: {
						finished_initial_setup: false,
						opted_out_of_shipping_setup: false,
						opted_out_of_taxes_setup: false,
						tried_customizer_during_initial_setup: false,
						created_default_shipping_zone: true,
						finished_initial_install_of_required_plugins: false,
						set_store_address_during_initial_setup: false,
					},
				} );
			} );
		} );
	} );

	describe( '#setFinishedInstallOfRequiredPlugins', () => {
		const siteId = '123';

		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/sites/123/calypso-preferences/woocommerce', {
					finished_initial_install_of_required_plugins: true,
				} )
				.reply( 200, {
					finished_initial_setup: false,
					opted_out_of_shipping_setup: false,
					opted_out_of_taxes_setup: false,
					tried_customizer_during_initial_setup: false,
					created_default_shipping_zone: false,
					finished_initial_install_of_required_plugins: true,
					set_store_address_during_initial_setup: false,
				} );
		} );

		test( 'should dispatch an action', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			setFinishedInstallOfRequiredPlugins( siteId, true )( dispatch, getState );
			expect( dispatch ).to.have.been.calledWith( {
				type: WOOCOMMERCE_SETUP_CHOICE_UPDATE_REQUEST,
				siteId,
				key: 'finished_initial_install_of_required_plugins',
				value: true,
			} );
		} );

		test( 'should dispatch a success action with setup choices when request completes', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const response = setFinishedInstallOfRequiredPlugins( siteId, true )( dispatch, getState );

			return response.then( () => {
				expect( dispatch ).to.have.been.calledWith( {
					type: WOOCOMMERCE_SETUP_CHOICE_UPDATE_REQUEST_SUCCESS,
					siteId,
					data: {
						finished_initial_setup: false,
						opted_out_of_shipping_setup: false,
						opted_out_of_taxes_setup: false,
						tried_customizer_during_initial_setup: false,
						created_default_shipping_zone: false,
						finished_initial_install_of_required_plugins: true,
						set_store_address_during_initial_setup: false,
					},
				} );
			} );
		} );
	} );

	describe( '#setUpStorePages', () => {
		const siteId = '123';

		const data = {
			id: 'install_pages',
			name: 'Install WooCommerce pages',
			action: 'Install pages',
			description: 'This tool will install all the missing WooCommerce pages.',
			success: true,
			message: 'All missing WooCommerce pages successfully installed',
		};

		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/jetpack-blogs/123/rest-api/', {
					path: '/wc/v3/system_status/tools/install_pages&_via_calypso&_method=post',
					body: JSON.stringify( {} ),
					json: true,
				} )
				.reply( 200, { data } );
		} );

		test( 'should dispatch an action', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			setUpStorePages( siteId )( dispatch, getState );
			expect( dispatch ).to.have.been.calledWith( {
				type: WOOCOMMERCE_SETUP_STORE_PAGES_REQUEST,
				siteId,
			} );
		} );

		test( 'should dispatch a setup choice update request action with request completes', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const response = setUpStorePages( siteId )( dispatch, getState );

			return response.then( () => {
				expect( dispatch ).to.have.been.calledWith( {
					type: WOOCOMMERCE_SETUP_CHOICE_UPDATE_REQUEST,
					siteId,
					key: 'finished_page_setup',
					value: true,
				} );
			} );
		} );
	} );

	describe( '#setCheckedTaxSetup', () => {
		const siteId = '123';

		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/sites/123/calypso-preferences/woocommerce', {
					checked_tax_setup: true,
				} )
				.reply( 200, {
					finished_initial_setup: false,
					opted_out_of_shipping_setup: false,
					opted_out_of_taxes_setup: false,
					tried_customizer_during_initial_setup: false,
					created_default_shipping_zone: false,
					finished_initial_install_of_required_plugins: false,
					set_store_address_during_initial_setup: false,
					checked_tax_setup: true,
				} );
		} );

		test( 'should dispatch an action', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			setCheckedTaxSetup( siteId, true )( dispatch, getState );
			expect( dispatch ).to.have.been.calledWith( {
				type: WOOCOMMERCE_SETUP_CHOICE_UPDATE_REQUEST,
				siteId,
				key: 'checked_tax_setup',
				value: true,
			} );
		} );

		test( 'should dispatch a success action with setup choices when request completes', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const response = setCheckedTaxSetup( siteId, true )( dispatch, getState );

			return response.then( () => {
				expect( dispatch ).to.have.been.calledWith( {
					type: WOOCOMMERCE_SETUP_CHOICE_UPDATE_REQUEST_SUCCESS,
					siteId,
					data: {
						finished_initial_setup: false,
						opted_out_of_shipping_setup: false,
						opted_out_of_taxes_setup: false,
						tried_customizer_during_initial_setup: false,
						created_default_shipping_zone: false,
						finished_initial_install_of_required_plugins: false,
						set_store_address_during_initial_setup: false,
						checked_tax_setup: true,
					},
				} );
			} );
		} );
	} );

	describe( '#setSetStoreAddressDuringInitialSetup', () => {
		const siteId = '123';

		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/sites/123/calypso-preferences/woocommerce', {
					set_store_address_during_initial_setup: true,
				} )
				.reply( 200, {
					finished_initial_setup: false,
					opted_out_of_shipping_setup: false,
					opted_out_of_taxes_setup: false,
					tried_customizer_during_initial_setup: false,
					created_default_shipping_zone: false,
					finished_initial_install_of_required_plugins: false,
					set_store_address_during_initial_setup: true,
				} );
		} );

		test( 'should dispatch an action', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			setSetStoreAddressDuringInitialSetup( siteId, true )( dispatch, getState );
			expect( dispatch ).to.have.been.calledWith( {
				type: WOOCOMMERCE_SETUP_CHOICE_UPDATE_REQUEST,
				siteId,
				key: 'set_store_address_during_initial_setup',
				value: true,
			} );
		} );

		test( 'should dispatch a success action with setup choices when request completes', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const response = setSetStoreAddressDuringInitialSetup( siteId, true )( dispatch, getState );

			return response.then( () => {
				expect( dispatch ).to.have.been.calledWith( {
					type: WOOCOMMERCE_SETUP_CHOICE_UPDATE_REQUEST_SUCCESS,
					siteId,
					data: {
						finished_initial_setup: false,
						opted_out_of_shipping_setup: false,
						opted_out_of_taxes_setup: false,
						tried_customizer_during_initial_setup: false,
						created_default_shipping_zone: false,
						finished_initial_install_of_required_plugins: false,
						set_store_address_during_initial_setup: true,
					},
				} );
			} );
		} );
	} );
} );
