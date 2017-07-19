/**
 * Internal dependencies
 */
import { areSettingsGeneralLoaded } from 'woocommerce/state/sites/settings/general/selectors';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import request from 'woocommerce/state/sites/http-request';
import {
	WOOCOMMERCE_SETTINGS_GENERAL_REQUEST,
	WOOCOMMERCE_SETTINGS_GENERAL_RECEIVE,
} from 'woocommerce/state/action-types';

export const handleSettingsGeneralSuccess = ( { dispatch }, action, next, { data } ) => {
	const { siteId } = action;
	dispatch( {
		type: WOOCOMMERCE_SETTINGS_GENERAL_RECEIVE,
		siteId,
		data,
	} );
	return next( action );
};

export const handleSettingsGeneralError = ( { dispatch }, action, next, error ) => {
	const { siteId } = action;
	dispatch( {
		type: WOOCOMMERCE_SETTINGS_GENERAL_RECEIVE,
		siteId,
		error,
	} );
	return next( action );
};

export const handleSettingsGeneral = ( { dispatch, getState }, action, next ) => {
	const { siteId } = action;

	if ( areSettingsGeneralLoaded( getState(), siteId ) ) {
		return;
	}

	dispatch( request( siteId, action ).get( 'settings/general' ) );
	return next( action );
};

export default {
	[ WOOCOMMERCE_SETTINGS_GENERAL_REQUEST ]: [ dispatchRequest(
		handleSettingsGeneral,
		handleSettingsGeneralSuccess,
		handleSettingsGeneralError
	) ]
};
