/** @format */

/**
 * Internal dependencies
 */

import request from '../../request';
import { setError } from '../../status/wc-api/actions';
import {
	WOOCOMMERCE_SETTINGS_PRODUCTS_UPDATE_REQUEST,
	WOOCOMMERCE_SETTINGS_PRODUCTS_UPDATE_REQUEST_FAILURE,
	WOOCOMMERCE_SETTINGS_PRODUCTS_UPDATE_REQUEST_SUCCESS,
	WOOCOMMERCE_SETTINGS_PRODUCTS_REQUEST,
	WOOCOMMERCE_SETTINGS_PRODUCTS_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';
import { areSettingsProductsLoaded, areSettingsProductsLoading } from './selectors';

export const fetchSettingsProducts = siteId => ( dispatch, getState ) => {
	if (
		areSettingsProductsLoaded( getState(), siteId ) ||
		areSettingsProductsLoading( getState(), siteId )
	) {
		return;
	}

	const getAction = {
		type: WOOCOMMERCE_SETTINGS_PRODUCTS_REQUEST,
		siteId,
	};

	dispatch( getAction );

	return request( siteId )
		.get( 'settings/products' )
		.then( data => {
			dispatch( {
				type: WOOCOMMERCE_SETTINGS_PRODUCTS_REQUEST_SUCCESS,
				siteId,
				data,
			} );
		} )
		.catch( err => {
			dispatch( setError( siteId, getAction, err ) );
		} );
};

/**
 * Updates settings/products via batch endpoint.
 *
 * @param {Number} siteId wpcom site id.
 * @param {Mixed}  settingsData, either single object { id: '', value: '' }, or array of settings objects
 * @return {Object} Action object
 */
export const updateSettingsProducts = ( siteId, settingsData ) => dispatch => {
	const updateData = Array.isArray( settingsData ) ? settingsData : [ settingsData ];
	const updateAction = {
		type: WOOCOMMERCE_SETTINGS_PRODUCTS_UPDATE_REQUEST,
		data: updateData,
		siteId,
	};

	dispatch( updateAction );

	return request( siteId )
		.post( 'settings/products/batch', { update: updateData } )
		.then( data => {
			dispatch( {
				type: WOOCOMMERCE_SETTINGS_PRODUCTS_UPDATE_REQUEST_SUCCESS,
				siteId,
				data,
			} );
		} )
		.catch( err => {
			dispatch( {
				type: WOOCOMMERCE_SETTINGS_PRODUCTS_UPDATE_REQUEST_FAILURE,
				error: err,
				data: updateData,
				siteId,
			} );
		} );
};
