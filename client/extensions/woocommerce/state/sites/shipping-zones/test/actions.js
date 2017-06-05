/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { fetchShippingZones } from '../actions';
import { LOADING } from 'woocommerce/state/constants';
import useNock from 'test/helpers/use-nock';
import { useSandbox } from 'test/helpers/use-sinon';
import {
	WOOCOMMERCE_API_FETCH_SHIPPING_ZONES,
	WOOCOMMERCE_API_FETCH_SHIPPING_ZONES_SUCCESS,
} from 'woocommerce/state/action-types';

describe( 'actions', () => {
	describe( '#fetchShippingZones()', () => {
		const siteId = '123';

		useSandbox();
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/jetpack-blogs/123/rest-api/' )
				.query( { path: '/wc/v2/shipping/zones&_method=get' } )
				.reply( 200, {
					data: [ {
						id: 0,
						name: 'Rest of the World',
						order: 0,
					} ]
				} );
		} );

		it( 'should dispatch an action', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			fetchShippingZones( siteId )( dispatch, getState );
			expect( dispatch ).to.have.been.calledWith( { type: WOOCOMMERCE_API_FETCH_SHIPPING_ZONES, siteId } );
		} );

		it( 'should dispatch a success action with shipping zone information when request completes', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const response = fetchShippingZones( siteId )( dispatch, getState );

			return response.then( () => {
				expect( dispatch ).to.have.been.calledWith( {
					type: WOOCOMMERCE_API_FETCH_SHIPPING_ZONES_SUCCESS,
					siteId,
					data: [ {
						id: 0,
						name: 'Rest of the World',
						order: 0,
					} ]
				} );
			} );
		} );

		it( 'should not dispatch if shipping zones are already loading for this site', () => {
			const getState = () => ( {
				extensions: {
					woocommerce: {
						sites: {
							[ siteId ]: {
								shippingZones: LOADING
							}
						}
					}
				}
			} );
			const dispatch = spy();
			fetchShippingZones( siteId )( dispatch, getState );
			expect( dispatch ).to.not.have.beenCalled;
		} );
	} );
} );
