/**
 * Internal dependencies
 */
import {
	areSettingsGeneralLoaded,
	areSettingsGeneralLoading,
} from './selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import request from '../../request';
import { setError } from '../../status/wc-api/actions';
import {
	WOOCOMMERCE_TAXES_ENABLED_UPDATE,
	WOOCOMMERCE_TAXES_ENABLED_UPDATE_SUCCESS,
	WOOCOMMERCE_CURRENCY_UPDATE,
	WOOCOMMERCE_CURRENCY_UPDATE_SUCCESS,
	WOOCOMMERCE_SETTINGS_GENERAL_REQUEST,
	WOOCOMMERCE_SETTINGS_GENERAL_REQUEST_FAILURE,
	WOOCOMMERCE_SETTINGS_GENERAL_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';

export const fetchSettingsGeneral = ( siteId, retries = 0 ) => ( dispatch, getState ) => {
	if (
		areSettingsGeneralLoaded( getState(), siteId ) ||
		areSettingsGeneralLoading( getState(), siteId )
	) {
		return;
	}

	const getAction = {
		type: WOOCOMMERCE_SETTINGS_GENERAL_REQUEST,
		siteId,
	};

	dispatch( getAction );

	return request( siteId ).get( 'settings/general' )
		.then( ( data ) => {
			dispatch( {
				type: WOOCOMMERCE_SETTINGS_GENERAL_REQUEST_SUCCESS,
				siteId,
				data,
			} );
		} )
		.catch( error => {
			dispatch( setError( siteId, getAction, error ) );
			dispatch( {
				type: WOOCOMMERCE_SETTINGS_GENERAL_REQUEST_FAILURE,
				siteId,
				error,
			} );
			//Retry Settigns General Fetch
			if ( 5 > retries ) {
				retries++;
				fetchSettingsGeneral( siteId )( dispatch, getState );
			}
		} );
};

const saveCurrencySuccess = ( siteId, data ) => {
	return {
		type: WOOCOMMERCE_CURRENCY_UPDATE_SUCCESS,
		siteId,
		data,
	};
};

export const saveCurrency = (
	siteId,
	currency,
	successAction = null,
	failureAction = null
) => ( dispatch, getState ) => {
	const state = getState();
	if ( ! siteId ) {
		siteId = getSelectedSiteId( state );
	}
	const updateAction = {
		type: WOOCOMMERCE_CURRENCY_UPDATE,
		siteId,
	};

	dispatch( updateAction );

	return request( siteId ).put( 'settings/general/woocommerce_currency', { value: currency } )
		.then( ( data ) => {
			dispatch( saveCurrencySuccess( siteId, data ) );
			if ( successAction ) {
				dispatch( successAction( data ) );
			}
		} )
		.catch( error => {
			dispatch( setError( siteId, updateAction, error ) );
			if ( failureAction ) {
				dispatch( failureAction( error ) );
			}
		} );
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
	return request( siteId ).post( 'settings/general/woocommerce_calc_taxes', { value } )
		.then( ( data ) => {
			dispatch( updateTaxesEnabledSettingSuccess( siteId, data ) );
			if ( successAction ) {
				dispatch( successAction( data ) );
			}
		} )
		.catch( error => {
			dispatch( setError( siteId, updateAction, error ) );
			if ( failureAction ) {
				dispatch( failureAction( error ) );
			}
		} );
};
