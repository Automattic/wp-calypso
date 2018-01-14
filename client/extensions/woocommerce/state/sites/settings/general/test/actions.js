/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { fetchSettingsGeneral } from '../actions';
import { updateStoreNoticeSettings } from '../../actions';
import useNock from 'test/helpers/use-nock';
import {
	WOOCOMMERCE_SETTINGS_BATCH_REQUEST,
	WOOCOMMERCE_SETTINGS_BATCH_REQUEST_SUCCESS,
	WOOCOMMERCE_SETTINGS_GENERAL_REQUEST,
} from 'woocommerce/state/action-types';

describe( 'actions', () => {
	describe( '#fetchSettingsGeneral()', () => {
		const siteId = '123';
		test( 'should return an action', () => {
			const action = fetchSettingsGeneral( siteId );
			expect( action ).to.eql( { type: WOOCOMMERCE_SETTINGS_GENERAL_REQUEST, siteId } );
		} );
	} );

	describe( '#updateStoreNoticeSettings()', () => {
		const siteId = '123';
		const settingsPayload = [
			{
				id: 'woocommerce_demo_store',
				value: 'no',
			},
			{
				id: 'woocommerce_demo_store_notice',
				value: 'test store notice',
			},
		];

		useNock( nock => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/jetpack-blogs/123/rest-api/' )
				.query( {
					path: '/wc/v3/settings/batch&_method=post',
					json: true,
					body: { update: settingsPayload },
				} )
				.reply( 200, {
					data: {
						update: settingsPayload,
					},
				} );
		} );

		test( 'should dispatch an action', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			updateStoreNoticeSettings( siteId )( dispatch, getState );
			expect( dispatch ).to.have.been.calledWith( {
				type: WOOCOMMERCE_SETTINGS_BATCH_REQUEST,
				siteId,
			} );
		} );

		test( 'should dispatch a success action with settings information when request completes', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const response = updateStoreNoticeSettings( siteId )( dispatch, getState );

			return response.then( () => {
				expect( dispatch ).to.have.been.calledWith( {
					type: WOOCOMMERCE_SETTINGS_BATCH_REQUEST_SUCCESS,
					siteId,
					data: {
						update: settingsPayload,
					},
				} );
			} );
		} );
	} );
} );
