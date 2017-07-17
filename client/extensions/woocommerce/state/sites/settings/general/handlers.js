/**
 * Internal dependencies
 */
import { areSettingsGeneralLoaded } from 'woocommerce/state/sites/settings/general/selectors';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { setError } from '../../status/wc-api/actions';
import {
	WOOCOMMERCE_SETTINGS_GENERAL_REQUEST,
	WOOCOMMERCE_SETTINGS_GENERAL_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';

export const handleSettingsGeneralSuccess = ( { dispatch }, action, next, { data } ) => {
	const { siteId } = action;
	dispatch( {
		type: WOOCOMMERCE_SETTINGS_GENERAL_REQUEST_SUCCESS,
		siteId,
		data,
	} );
};

export const handleSettingsGeneralError = ( { dispatch }, action, next, error ) => {
	const { siteId } = action;
	dispatch( setError( siteId, action, error ) );
};

export const handleSettingsGeneral = ( { dispatch, getState }, action ) => {
	const { siteId } = action;

	if ( areSettingsGeneralLoaded( getState(), siteId ) ) {
		return;
	}

	// TODO Create a wrapper for these kinds of calls
	dispatch( http( {
		apiVersion: '1.1',
		method: 'GET',
		path: `/jetpack-blogs/${ siteId }/rest-api/`,
		query: {
			path: '/wc/v3/settings/general',
			_method: 'GET',
			json: true,
		}
	}, action ) );
};

export default {
	[ WOOCOMMERCE_SETTINGS_GENERAL_REQUEST ]: [ dispatchRequest(
		handleSettingsGeneral,
		handleSettingsGeneralSuccess,
		handleSettingsGeneralError
	) ]
};
