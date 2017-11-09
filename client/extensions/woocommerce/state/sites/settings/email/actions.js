/**
 * Internal dependencies
 */
import request from '../../request';
import { setError } from '../../status/wc-api/actions';
import {
	WOOCOMMERCE_EMAIL_SETTINGS_REQUEST,
	WOOCOMMERCE_EMAIL_SETTINGS_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';
import { areSettingsProductsLoaded, areSettingsProductsLoading } from './selectors';

export const fetchEmailSettings = siteId => ( dispatch, getState ) => {
	// if (
	// 	areSettingsProductsLoaded( getState(), siteId ) ||
	// 	areSettingsProductsLoading( getState(), siteId )
	// ) {
	// 	return;
	// }

	const getAction = {
		type: WOOCOMMERCE_EMAIL_SETTINGS_REQUEST,
		siteId,
	};

	dispatch( getAction );

	return request( siteId )
		.get( 'settings/email', 'wc/v2' )
		.then( data => {
			dispatch( {
				type: WOOCOMMERCE_EMAIL_SETTINGS_REQUEST_SUCCESS,
				siteId,
				data,
			} );
		} )
		.catch( err => {
			dispatch( setError( siteId, getAction, err ) );
		} );
};
