/**
 * Internal dependencies
 */
import request from '../../request';
import { setError } from '../../status/wc-api/actions';
import {
	WOOCOMMERCE_SETTINGS_GENERAL_REQUEST,
	WOOCOMMERCE_SETTINGS_GENERAL_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';
import {
	areSettingsGeneralLoaded,
	areSettingsGeneralLoading,
} from './selectors';

export const fetchSettingsGeneral = ( siteId ) => ( dispatch, getState ) => {
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
		.catch( err => {
			dispatch( setError( siteId, getAction, err ) );
		} );
};
