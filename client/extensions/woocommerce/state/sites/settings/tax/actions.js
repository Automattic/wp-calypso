/**
 * Internal dependencies
 */

import { areTaxSettingsLoaded, areTaxSettingsLoading } from './selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import request from 'woocommerce/state/sites/request';
import { setError } from '../../status/wc-api/actions';
import {
	WOOCOMMERCE_SETTINGS_TAX_BATCH_REQUEST,
	WOOCOMMERCE_SETTINGS_TAX_BATCH_REQUEST_SUCCESS,
	WOOCOMMERCE_SETTINGS_TAX_REQUEST,
	WOOCOMMERCE_SETTINGS_TAX_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';

export const fetchTaxSettings = ( siteId ) => ( dispatch, getState ) => {
	if ( areTaxSettingsLoaded( getState(), siteId ) || areTaxSettingsLoading( getState(), siteId ) ) {
		return;
	}

	const getAction = {
		type: WOOCOMMERCE_SETTINGS_TAX_REQUEST,
		siteId,
	};

	dispatch( getAction );

	return request( siteId )
		.get( 'settings/tax' )
		.then( ( data ) => {
			dispatch( {
				type: WOOCOMMERCE_SETTINGS_TAX_REQUEST_SUCCESS,
				siteId,
				data,
			} );
		} )
		.catch( ( err ) => {
			dispatch( setError( siteId, getAction, err ) );
		} );
};

const updateTaxSettingsSuccess = ( siteId, data ) => {
	return {
		type: WOOCOMMERCE_SETTINGS_TAX_BATCH_REQUEST_SUCCESS,
		siteId,
		data,
	};
};

export const updateTaxSettings = (
	siteId,
	pricesIncludeTax,
	shippingIsTaxFree,
	successAction,
	failureAction
) => ( dispatch, getState ) => {
	const state = getState();
	if ( ! siteId ) {
		siteId = getSelectedSiteId( state );
	}
	const updateAction = {
		type: WOOCOMMERCE_SETTINGS_TAX_BATCH_REQUEST,
		siteId,
	};

	dispatch( updateAction );

	const update = [
		{
			id: 'woocommerce_prices_include_tax',
			value: pricesIncludeTax ? 'yes' : 'no',
		},
		{
			id: 'woocommerce_shipping_tax_class',
			value: shippingIsTaxFree ? 'zero-rate' : '',
		},
	];
	return request( siteId )
		.post( 'settings/tax/batch', { update } )
		.then( ( data ) => {
			dispatch( updateTaxSettingsSuccess( siteId, data ) );
			if ( successAction ) {
				dispatch( successAction( data ) );
			}
		} )
		.catch( ( err ) => {
			dispatch( setError( siteId, updateAction, err ) );
			if ( failureAction ) {
				dispatch( failureAction( err ) );
			}
		} );
};
