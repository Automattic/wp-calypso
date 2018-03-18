/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { fetchShippingZones } from '../actions';
import useNock from 'test/helpers/use-nock';
import {
	WOOCOMMERCE_SHIPPING_ZONES_REQUEST,
	WOOCOMMERCE_SHIPPING_ZONES_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';
import { LOADING } from 'woocommerce/state/constants';

describe( 'actions', () => {
	describe( '#fetchShippingZones()', () => {
		const siteId = '123';

		useNock( nock => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/jetpack-blogs/123/rest-api/' )
				.query( { path: '/wc/v3/shipping/zones&_via_calypso&_method=get', json: true } )
				.reply( 200, {
					data: [
						{
							id: 0,
							name: 'Locations not covered by your other zones',
							order: 0,
						},
					],
				} );
		} );

		test( 'should dispatch an action', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			fetchShippingZones( siteId )( dispatch, getState );
			expect( dispatch ).to.have.been.calledWith( {
				type: WOOCOMMERCE_SHIPPING_ZONES_REQUEST,
				siteId,
			} );
		} );

		test( 'should dispatch a success action with shipping zone information when request completes', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const response = fetchShippingZones( siteId )( dispatch, getState );

			return response.then( () => {
				expect( dispatch ).to.have.been.calledWith( {
					type: WOOCOMMERCE_SHIPPING_ZONES_REQUEST_SUCCESS,
					siteId,
					data: [
						{
							id: 0,
							name: 'Locations not covered by your other zones',
							order: 0,
						},
					],
				} );
			} );
		} );

		test( 'should not dispatch if shipping zones are already loading for this site', () => {
			const getState = () => ( {
				extensions: {
					woocommerce: {
						sites: {
							[ siteId ]: {
								shippingZones: LOADING,
							},
						},
					},
				},
			} );
			const dispatch = spy();
			fetchShippingZones( siteId )( dispatch, getState );
			expect( dispatch ).to.not.have.beenCalled;
		} );
	} );
} );
