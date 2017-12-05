/**
 * Internal dependencies
 */
import request from 'woocommerce/state/sites/request';
import { setError } from '../../status/wc-api/actions';
import {
	WOOCOMMERCE_EMAIL_SETTINGS_CHANGE,
	WOOCOMMERCE_EMAIL_SETTINGS_REQUEST,
	WOOCOMMERCE_EMAIL_SETTINGS_REQUEST_SUCCESS,
	WOOCOMMERCE_EMAIL_SETTINGS_SAVE_SETTINGS,
} from 'woocommerce/state/action-types';
import { areEmailSettingsLoaded, areEmailSettingsLoading } from './selectors';

export const fetchEmailSettings = siteId => ( dispatch, getState ) => {
	if (
		areEmailSettingsLoaded( getState(), siteId ) ||
		areEmailSettingsLoading( getState(), siteId )
	) {
		return;
	}

	const getAction = {
		type: WOOCOMMERCE_EMAIL_SETTINGS_REQUEST,
		siteId,
	};

	dispatch( getAction );

	return request( siteId )
		.get( 'settings_email_groups' )
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

export const emailSettingChange = ( siteId, setting ) => ( dispatch ) => {
	dispatch( {
		type: WOOCOMMERCE_EMAIL_SETTINGS_CHANGE,
		siteId,
		setting,
	} );
};

/**
 * Triggers a internal action that represents request to save settings
 * Components interested in this action will subscribe to store with
 * isSaveSettingsReqested
 *
 * @param  {Number|String} siteId      Jetpack site ID
 * @param  {Object}        newsLetter  MailChimp newsletter settings object
 * @return {Function}                  Action thunk
 */
export const emailSettingsSaveSettings = ( siteId ) => ( dispatch ) => {
	if ( null == siteId ) {
		return;
	}

	dispatch( {
		type: WOOCOMMERCE_EMAIL_SETTINGS_SAVE_SETTINGS,
		siteId,
	} );
};
