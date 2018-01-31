/**
 * @format
 */

/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_EMAIL_SETTINGS_CHANGE,
	WOOCOMMERCE_EMAIL_SETTINGS_REQUEST,
	WOOCOMMERCE_EMAIL_SETTINGS_UPDATE,
	WOOCOMMERCE_EMAIL_SETTINGS_SAVE_SETTINGS,
	WOOCOMMERCE_EMAIL_SETTINGS_INVALID_VALUE,
} from 'woocommerce/state/action-types';

export const requestEmailSettings = siteId => ( {
	type: WOOCOMMERCE_EMAIL_SETTINGS_REQUEST,
	siteId,
} );

export const emailSettingChange = ( siteId, setting ) => dispatch => {
	dispatch( {
		type: WOOCOMMERCE_EMAIL_SETTINGS_CHANGE,
		siteId,
		setting,
	} );
};

/**
 * Triggers a internal action that represents request to save settings
 * Components interested in this action will subscribe to store with
 * isSaveSettingsRequested
 *
 * @param  {Number|String} siteId      Jetpack site ID
 * @return {Function}                  Action thunk
 */
export const emailSettingsSaveSettings = siteId => dispatch => {
	if ( null == siteId ) {
		return;
	}

	dispatch( {
		type: WOOCOMMERCE_EMAIL_SETTINGS_SAVE_SETTINGS,
		siteId,
	} );
};

export const emailSettingsUpdate = siteId => ( {
	type: WOOCOMMERCE_EMAIL_SETTINGS_UPDATE,
	siteId,
} );

export const emailSettingsInvalidValue = ( siteId, reason ) => dispatch => {
	return dispatch( {
		type: WOOCOMMERCE_EMAIL_SETTINGS_INVALID_VALUE,
		siteId,
		reason,
	} );
};
