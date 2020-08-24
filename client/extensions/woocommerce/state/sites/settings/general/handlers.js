/**
 * Internal dependencies
 */

import { areSettingsGeneralLoaded } from 'woocommerce/state/sites/settings/general/selectors';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { put } from 'woocommerce/state/data-layer/request/actions';
import request from 'woocommerce/state/sites/http-request';
import { saveCurrencySuccess } from 'woocommerce/state/sites/settings/general/actions';
import {
	WOOCOMMERCE_CURRENCY_UPDATE,
	WOOCOMMERCE_SETTINGS_GENERAL_REQUEST,
	WOOCOMMERCE_SETTINGS_GENERAL_RECEIVE,
} from 'woocommerce/state/action-types';

export const handleSettingsGeneralSuccess = ( action, { data } ) => {
	const { siteId } = action;
	return {
		type: WOOCOMMERCE_SETTINGS_GENERAL_RECEIVE,
		siteId,
		data,
	};
};

export const handleSettingsGeneralError = ( action, error ) => {
	const { siteId } = action;
	return {
		type: WOOCOMMERCE_SETTINGS_GENERAL_RECEIVE,
		siteId,
		error,
	};
};

export const handleSettingsGeneral = ( action ) => ( dispatch, getState ) => {
	const { siteId } = action;

	if ( areSettingsGeneralLoaded( getState(), siteId ) ) {
		return;
	}

	dispatch( request( siteId, action ).get( 'settings/general' ) );
};

/**
 * Issues a PUT request to settings/general/woocommerce_currency
 *
 * @param {object} action - and action with the following fields: siteId, currency, successAction, failureAction
 */
export const handleCurrencyUpdate = ( { dispatch }, action ) => {
	const { siteId, currency, successAction, failureAction } = action;

	const payload = {
		value: currency,
	};

	/**
	 * A callback issued after a successful request
	 *
	 * @param {Function} localDispatch - dispatch function
	 * @param {Function} getState - getState function
	 * @param {object} data - data returned by the server
	 */
	const updatedAction = ( localDispatch, getState, { data } ) => {
		localDispatch( saveCurrencySuccess( siteId, data, action ) );
		localDispatch( successAction );
	};

	dispatch(
		put( siteId, 'settings/general/woocommerce_currency', payload, updatedAction, failureAction )
	);
};

export default {
	[ WOOCOMMERCE_SETTINGS_GENERAL_REQUEST ]: [
		dispatchRequest( {
			fetch: handleSettingsGeneral,
			onSuccess: handleSettingsGeneralSuccess,
			onError: handleSettingsGeneralError,
		} ),
	],
	[ WOOCOMMERCE_CURRENCY_UPDATE ]: [ handleCurrencyUpdate ],
};
