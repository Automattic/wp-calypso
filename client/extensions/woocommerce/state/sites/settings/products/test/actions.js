/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { fetchSettingsProducts } from '../actions';
import useNock from 'test/helpers/use-nock';
import { useSandbox } from 'test/helpers/use-sinon';
import { WOOCOMMERCE_SETTINGS_PRODUCTS_REQUEST, WOOCOMMERCE_SETTINGS_PRODUCTS_REQUEST_SUCCESS } from 'woocommerce/state/action-types';
import { LOADING } from 'woocommerce/state/constants';

describe( 'actions', () => {
	describe( '#fetchSettingsProducts()', () => {
		const siteId = '123';

		useSandbox();
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/jetpack-blogs/123/rest-api/' )
				.query( { path: '/wc/v3/settings/products&_method=get', json: true } )
				.reply( 200, {
					data: [ {
						id: 'woocommerce_weight_unit',
						label: 'Weight unit',
						description: 'This controls what unit you will define weights in.',
						type: 'select',
						'default': 'kg',
						tip: 'This controls what unit you will define weights in.',
						value: 'lbs',
						options: {},
					} ]
				} );
		} );

		it( 'should dispatch an action', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			fetchSettingsProducts( siteId )( dispatch, getState );
			expect( dispatch ).to.have.been.calledWith( { type: WOOCOMMERCE_SETTINGS_PRODUCTS_REQUEST, siteId } );
		} );

		it( 'should dispatch a success action with settings information when request completes', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const response = fetchSettingsProducts( siteId )( dispatch, getState );

			return response.then( () => {
				expect( dispatch ).to.have.been.calledWith( {
					type: WOOCOMMERCE_SETTINGS_PRODUCTS_REQUEST_SUCCESS,
					siteId,
					data: [ {
						id: 'woocommerce_weight_unit',
						label: 'Weight unit',
						description: 'This controls what unit you will define weights in.',
						type: 'select',
						'default': 'kg',
						tip: 'This controls what unit you will define weights in.',
						value: 'lbs',
						options: {},
					} ]
				} );
			} );
		} );

		it( 'should not dispatch if settings are already loading for this site', () => {
			const getState = () => ( {
				extensions: {
					woocommerce: {
						sites: {
							[ siteId ]: {
								settings: {
									products: LOADING
								}
							}
						}
					}
				}
			} );
			const dispatch = spy();
			fetchSettingsProducts( siteId )( dispatch, getState );
			expect( dispatch ).to.not.have.beenCalled;
		} );
	} );
} );
