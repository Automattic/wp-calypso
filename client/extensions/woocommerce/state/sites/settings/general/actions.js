/**
 * Internal dependencies
 */

import { getSelectedSiteId } from 'state/ui/selectors';
import request from 'woocommerce/state/sites/request';
import { setError } from '../../status/wc-api/actions';
import {
	WOOCOMMERCE_TAXES_ENABLED_UPDATE,
	WOOCOMMERCE_TAXES_ENABLED_UPDATE_SUCCESS,
	WOOCOMMERCE_CURRENCY_UPDATE,
	WOOCOMMERCE_CURRENCY_UPDATE_SUCCESS,
	WOOCOMMERCE_SETTINGS_GENERAL_REQUEST,
} from 'woocommerce/state/action-types';

export const fetchSettingsGeneral = ( siteId ) => {
	return {
		type: WOOCOMMERCE_SETTINGS_GENERAL_REQUEST,
		siteId,
	};
};

export const saveCurrencySuccess = ( siteId, data ) => {
	return {
		type: WOOCOMMERCE_CURRENCY_UPDATE_SUCCESS,
		siteId,
		data,
	};
};

export const saveCurrency = ( siteId, currency, successAction = null, failureAction = null ) => {
	return {
		type: WOOCOMMERCE_CURRENCY_UPDATE,
		siteId,
		currency,
		successAction,
		failureAction,
	};
};

// TODO - we probably only need on individual setter (not separate ones for currency, taxes enabled, etc)

const updateTaxesEnabledSettingSuccess = ( siteId, data ) => {
	return {
		type: WOOCOMMERCE_TAXES_ENABLED_UPDATE_SUCCESS,
		siteId,
		data,
	};
};

export const updateTaxesEnabledSetting = (
	siteId,
	taxesEnabled,
	successAction = null,
	failureAction = null
) => ( dispatch, getState ) => {
	const state = getState();
	if ( ! siteId ) {
		siteId = getSelectedSiteId( state );
	}
	const updateAction = {
		type: WOOCOMMERCE_TAXES_ENABLED_UPDATE,
		siteId,
	};

	dispatch( updateAction );

	const value = taxesEnabled ? 'yes' : 'no';
	return request( siteId )
		.post( 'settings/general/woocommerce_calc_taxes', { value } )
		.then( ( data ) => {
			dispatch( updateTaxesEnabledSettingSuccess( siteId, data ) );
			if ( successAction ) {
				dispatch( successAction( data ) );
			}
		} )
		.catch( ( error ) => {
			dispatch( setError( siteId, updateAction, error ) );
			if ( failureAction ) {
				dispatch( failureAction( error ) );
			}
		} );
};
