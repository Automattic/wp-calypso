/** @format */

/**
 * Internal dependencies
 */

import { areSettingsGeneralLoaded } from 'client/extensions/woocommerce/state/sites/settings/general/selectors';
import { dispatchRequest } from 'client/state/data-layer/wpcom-http/utils';
import { put } from 'client/extensions/woocommerce/state/data-layer/request/actions';
import request from 'client/extensions/woocommerce/state/sites/http-request';
import { saveCurrencySuccess } from 'client/extensions/woocommerce/state/sites/settings/general/actions';
import {
	WOOCOMMERCE_CURRENCY_UPDATE,
	WOOCOMMERCE_SETTINGS_GENERAL_REQUEST,
	WOOCOMMERCE_SETTINGS_GENERAL_RECEIVE,
} from 'client/extensions/woocommerce/state/action-types';

export const handleSettingsGeneralSuccess = ( { dispatch }, action, { data } ) => {
	const { siteId } = action;
	dispatch( {
		type: WOOCOMMERCE_SETTINGS_GENERAL_RECEIVE,
		siteId,
		data,
	} );
};

export const handleSettingsGeneralError = ( { dispatch }, action, error ) => {
	const { siteId } = action;
	dispatch( {
		type: WOOCOMMERCE_SETTINGS_GENERAL_RECEIVE,
		siteId,
		error,
	} );
};

export const handleSettingsGeneral = ( { dispatch, getState }, action ) => {
	const { siteId } = action;

	if ( areSettingsGeneralLoaded( getState(), siteId ) ) {
		return;
	}

	dispatch( request( siteId, action ).get( 'settings/general' ) );
};

/**
 * Issues a PUT request to settings/general/woocommerce_currency
 * @param {Object} store - Redux store
 * @param {Object} action - and action with the following fields: siteId, currency, successAction, failureAction
 */
export const handleCurrencyUpdate = ( store, action ) => {
	const { siteId, currency, successAction, failureAction } = action;

	const payload = {
		value: currency,
	};

	/**
	 * A callback issued after a successful request
	 * @param {Function} dispatch - dispatch function
	 * @param {Function} getState - getState function
	 * @param {Object} data - data returned by the server
	 */
	const updatedAction = ( dispatch, getState, { data } ) => {
		dispatch( saveCurrencySuccess( siteId, data, action ) );
		dispatch( successAction );
	};

	store.dispatch(
		put( siteId, 'settings/general/woocommerce_currency', payload, updatedAction, failureAction )
	);
};

export default {
	[ WOOCOMMERCE_SETTINGS_GENERAL_REQUEST ]: [
		dispatchRequest(
			handleSettingsGeneral,
			handleSettingsGeneralSuccess,
			handleSettingsGeneralError
		),
	],
	[ WOOCOMMERCE_CURRENCY_UPDATE ]: [ handleCurrencyUpdate ],
};
