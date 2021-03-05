/**
 * External dependencies
 *
 */

import { forEach, reduce, omit, get, has } from 'lodash';

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
	WOOCOMMERCE_EMAIL_SETTINGS_SUBMIT,
	WOOCOMMERCE_EMAIL_SETTINGS_SUBMIT_SUCCESS,
	WOOCOMMERCE_EMAIL_SETTINGS_SUBMIT_FAILURE,
	WOOCOMMERCE_EMAIL_SETTINGS_INVALID_VALUE,
} from 'woocommerce/state/action-types';
import { areEmailSettingsLoaded, areEmailSettingsLoading } from './selectors';

export const fetchEmailSettings = ( siteId ) => ( dispatch, getState ) => {
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
		.then( ( data ) => {
			dispatch( {
				type: WOOCOMMERCE_EMAIL_SETTINGS_REQUEST_SUCCESS,
				siteId,
				data,
			} );
		} )
		.catch( ( err ) => {
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
 * isSaveSettingsRequested
 *
 * @param  {number|string} siteId      Jetpack site ID
 * @returns {Function}                  Action thunk
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

const settingsSubmit = ( siteId ) => ( {
	type: WOOCOMMERCE_EMAIL_SETTINGS_SUBMIT,
	siteId,
} );

const settingsSubmitSuccess = ( siteId, update ) => ( {
	type: WOOCOMMERCE_EMAIL_SETTINGS_SUBMIT_SUCCESS,
	siteId,
	update,
} );

const settingsSubmitFailure = ( siteId, { error } ) => ( {
	type: WOOCOMMERCE_EMAIL_SETTINGS_SUBMIT_FAILURE,
	siteId,
	error,
} );

export const emailSettingsSubmitSettings = ( siteId, settings ) => ( dispatch ) => {
	if ( null == siteId ) {
		return;
	}

	dispatch( settingsSubmit( siteId ) );

	// disable if user has emptied the input field
	forEach( [ 'email_new_order', 'email_cancelled_order', 'email_failed_order' ], ( option ) => {
		if ( get( settings, [ option, 'recipient', 'value' ], '' ).trim() === '' ) {
			if ( has( settings, [ option, 'enabled' ] ) ) {
				settings[ option ].enabled.value = 'no';
			}
		}
	} );

	const update = reduce(
		omit( settings, [ 'save', 'isSaving', 'error' ] ),
		( result, options, group_id ) => {
			forEach( options, ( option, id ) => {
				result.push( {
					group_id,
					id,
					value: option.value.trim(),
				} );
			} );
			return result;
		},
		[]
	);

	return request( siteId )
		.post( 'settings/batch', { update } )
		.then( ( data ) => {
			dispatch( settingsSubmitSuccess( siteId, data ) );
		} )
		.catch( ( error ) => {
			dispatch( settingsSubmitFailure( siteId, error ) );
		} );
};

export const emailSettingsInvalidValue = ( siteId, reason ) => ( dispatch ) => {
	return dispatch( {
		type: WOOCOMMERCE_EMAIL_SETTINGS_INVALID_VALUE,
		siteId,
		reason,
	} );
};
