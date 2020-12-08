/**
 * External dependencies
 */
import { keys } from 'lodash';

/**
 * Internal dependencies
 */
import { combineReducers } from 'calypso/state/utils';
import {
	WOOCOMMERCE_MAILCHIMP_API_KEY_SUBMIT_FAILURE,
	WOOCOMMERCE_MAILCHIMP_API_KEY_SUBMIT_SUCCESS,
	WOOCOMMERCE_MAILCHIMP_API_KEY_SUBMIT,
	WOOCOMMERCE_MAILCHIMP_CAMPAIGN_DEFAULTS_SUBMIT_SUCCESS,
	WOOCOMMERCE_MAILCHIMP_LISTS_REQUEST_FAILURE,
	WOOCOMMERCE_MAILCHIMP_LISTS_REQUEST_SUCCESS,
	WOOCOMMERCE_MAILCHIMP_LISTS_REQUEST,
	WOOCOMMERCE_MAILCHIMP_NEWSLETTER_SETTINGS_SUBMIT_FAILURE,
	WOOCOMMERCE_MAILCHIMP_NEWSLETTER_SETTINGS_SUBMIT_SUCCESS,
	WOOCOMMERCE_MAILCHIMP_NEWSLETTER_SETTINGS_SUBMIT,
	WOOCOMMERCE_MAILCHIMP_RESYNC_REQUEST_FAILURE,
	WOOCOMMERCE_MAILCHIMP_RESYNC_REQUEST_SUCCESS,
	WOOCOMMERCE_MAILCHIMP_RESYNC_REQUEST,
	WOOCOMMERCE_MAILCHIMP_SAVE_SETTINGS,
	WOOCOMMERCE_MAILCHIMP_SETTINGS_REQUEST_FAILURE,
	WOOCOMMERCE_MAILCHIMP_SETTINGS_REQUEST_SUCCESS,
	WOOCOMMERCE_MAILCHIMP_SETTINGS_REQUEST,
	WOOCOMMERCE_MAILCHIMP_STORE_INFO_SUBMIT_FAILURE,
	WOOCOMMERCE_MAILCHIMP_STORE_INFO_SUBMIT_SUCCESS,
	WOOCOMMERCE_MAILCHIMP_STORE_INFO_SUBMIT,
	WOOCOMMERCE_MAILCHIMP_SYNC_STATUS_REQUEST_FAILURE,
	WOOCOMMERCE_MAILCHIMP_SYNC_STATUS_REQUEST_SUCCESS,
	WOOCOMMERCE_MAILCHIMP_SYNC_STATUS_REQUEST,
} from 'woocommerce/state/action-types';

/**
 * Updates state with latest MailChimp connected plugin settings
 *
 * @param  {object} state  Current state
 * @param  {object} action Action
 * @returns {object}        Updated state
 */
function settings( state = {}, action ) {
	switch ( action.type ) {
		case WOOCOMMERCE_MAILCHIMP_SETTINGS_REQUEST_SUCCESS:
		case WOOCOMMERCE_MAILCHIMP_SETTINGS_REQUEST_FAILURE:
		case WOOCOMMERCE_MAILCHIMP_API_KEY_SUBMIT_SUCCESS:
		case WOOCOMMERCE_MAILCHIMP_STORE_INFO_SUBMIT_SUCCESS:
		case WOOCOMMERCE_MAILCHIMP_CAMPAIGN_DEFAULTS_SUBMIT_SUCCESS:
		case WOOCOMMERCE_MAILCHIMP_NEWSLETTER_SETTINGS_SUBMIT_SUCCESS:
			return Object.assign( {}, state, action.settings );
		case WOOCOMMERCE_MAILCHIMP_LISTS_REQUEST_SUCCESS:
			const data = { mailchimp_lists: action.lists };
			const listKeys = keys( action.lists );
			if ( ! state.mailchimp_list && listKeys.length > 0 ) {
				// Just pick first that will be shown to the user in the dropdown
				// We are setting mailchimp_list just in case user likes it and clicks
				// Continue without actually sellecting something.
				data.mailchimp_list = listKeys[ 0 ];
			}
			return Object.assign( {}, state, data );
	}

	return state;
}

/**
 * Updates state with settings request status
 *
 * @param  {object} state  Current state
 * @param  {object} action Action
 * @returns {object}        Updated state
 */
function settingsRequest( state = false, { type } ) {
	switch ( type ) {
		case WOOCOMMERCE_MAILCHIMP_SETTINGS_REQUEST:
		case WOOCOMMERCE_MAILCHIMP_SETTINGS_REQUEST_SUCCESS:
		case WOOCOMMERCE_MAILCHIMP_SETTINGS_REQUEST_FAILURE:
			return WOOCOMMERCE_MAILCHIMP_SETTINGS_REQUEST === type;
	}

	return state;
}

/**
 * Updates state with settings request error
 * Holds information only for latest request
 *
 * @param  {object} state  Current state
 * @param  {object} action Action
 * @returns {object}        Updated state
 */
function settingsRequestError( state = false, action ) {
	switch ( action.type ) {
		case WOOCOMMERCE_MAILCHIMP_SETTINGS_REQUEST_SUCCESS:
		case WOOCOMMERCE_MAILCHIMP_SETTINGS_REQUEST_FAILURE:
			const error =
				WOOCOMMERCE_MAILCHIMP_SETTINGS_REQUEST_FAILURE === action.type ? action.error : false;
			return error;
	}

	return state;
}

/**
 * Updates state with latest MailChimp connected plugin sync status.
 * This is sync between plugin and mailchimp server
 *
 * @param  {object} state  Current state
 * @param  {object} action Action
 * @returns {object}        Updated state
 */
function syncStatus( state = {}, action ) {
	switch ( action.type ) {
		case WOOCOMMERCE_MAILCHIMP_SYNC_STATUS_REQUEST_SUCCESS:
		case WOOCOMMERCE_MAILCHIMP_RESYNC_REQUEST_SUCCESS:
			return Object.assign( {}, action.syncStatus );
	}

	return state;
}

/**
 * Updates state with sync status request status
 *
 * @param  {object} state  Current state
 * @param  {object} action Action
 * @returns {object}        Updated state
 */
function syncStatusRequest( state = false, { type } ) {
	switch ( type ) {
		case WOOCOMMERCE_MAILCHIMP_SYNC_STATUS_REQUEST:
		case WOOCOMMERCE_MAILCHIMP_SYNC_STATUS_REQUEST_SUCCESS:
		case WOOCOMMERCE_MAILCHIMP_SYNC_STATUS_REQUEST_FAILURE:
			return WOOCOMMERCE_MAILCHIMP_SYNC_STATUS_REQUEST === type;
	}

	return state;
}

/**
 * Updates state with sync status request error
 * Holds information only for latest request
 *
 * @param  {object} state  Current state
 * @param  {object} action Action
 * @returns {object}        Updated state
 */
function syncStatusRequestError( state = false, action ) {
	switch ( action.type ) {
		case WOOCOMMERCE_MAILCHIMP_SYNC_STATUS_REQUEST_SUCCESS:
		case WOOCOMMERCE_MAILCHIMP_SYNC_STATUS_REQUEST_FAILURE:
			const error =
				WOOCOMMERCE_MAILCHIMP_SYNC_STATUS_REQUEST_FAILURE === action.type ? action.error : false;
			return error;
	}

	return state;
}

/**
 * Updates state with resync request status
 *
 * @param  {object} state  Current state
 * @param  {object} action Action
 * @returns {object}        Updated state
 */
function resyncRequest( state = false, { type } ) {
	switch ( type ) {
		case WOOCOMMERCE_MAILCHIMP_RESYNC_REQUEST:
		case WOOCOMMERCE_MAILCHIMP_RESYNC_REQUEST_SUCCESS:
		case WOOCOMMERCE_MAILCHIMP_RESYNC_REQUEST_FAILURE:
			return WOOCOMMERCE_MAILCHIMP_RESYNC_REQUEST === type;
	}

	return state;
}

/**
 * Updates state with sync status request error
 * Holds information only for latest request
 *
 * @param  {object} state  Current state
 * @param  {object} action Action
 * @returns {object}        Updated state
 */
function resyncRequestError( state = false, action ) {
	switch ( action.type ) {
		case WOOCOMMERCE_MAILCHIMP_RESYNC_REQUEST_SUCCESS:
		case WOOCOMMERCE_MAILCHIMP_RESYNC_REQUEST_FAILURE:
			const error =
				WOOCOMMERCE_MAILCHIMP_RESYNC_REQUEST_FAILURE === action.type ? action.error : false;
			return error;
	}

	return state;
}

/**
 * Updates state with api key submit status
 *
 * @param  {object} state  Current state
 * @param  {object} action Action
 * @returns {object}        Updated state
 */
function apiKeySubmit( state = false, { type } ) {
	switch ( type ) {
		case WOOCOMMERCE_MAILCHIMP_API_KEY_SUBMIT:
		case WOOCOMMERCE_MAILCHIMP_API_KEY_SUBMIT_SUCCESS:
		case WOOCOMMERCE_MAILCHIMP_API_KEY_SUBMIT_FAILURE:
			return WOOCOMMERCE_MAILCHIMP_API_KEY_SUBMIT === type;
	}

	return state;
}

/**
 * Updates state with api key submit error
 * Holds information only for latest request
 *
 * @param  {object} state  Current state
 * @param  {object} action Action
 * @returns {object}        Updated state
 */
function apiKeySubmitError( state = false, action ) {
	switch ( action.type ) {
		case WOOCOMMERCE_MAILCHIMP_API_KEY_SUBMIT_SUCCESS:
		case WOOCOMMERCE_MAILCHIMP_API_KEY_SUBMIT_FAILURE:
			const error =
				WOOCOMMERCE_MAILCHIMP_API_KEY_SUBMIT_FAILURE === action.type ? action.error : false;
			return error;
	}

	return state;
}

/**
 * Updates state with store info submit status
 *
 * @param  {object} state  Current state
 * @param  {object} action Action
 * @returns {object}        Updated state
 */
function storeInfoSubmit( state = false, { type } ) {
	switch ( type ) {
		case WOOCOMMERCE_MAILCHIMP_STORE_INFO_SUBMIT:
		case WOOCOMMERCE_MAILCHIMP_STORE_INFO_SUBMIT_SUCCESS:
		case WOOCOMMERCE_MAILCHIMP_STORE_INFO_SUBMIT_FAILURE:
			return WOOCOMMERCE_MAILCHIMP_STORE_INFO_SUBMIT === type;
	}

	return state;
}

/**
 * Updates state with store info submit error
 * Holds information only for latest request
 *
 * @param  {object} state  Current state
 * @param  {object} action Action
 * @returns {object}        Updated state
 */
function storeInfoSubmitError( state = false, action ) {
	switch ( action.type ) {
		case WOOCOMMERCE_MAILCHIMP_STORE_INFO_SUBMIT_SUCCESS:
		case WOOCOMMERCE_MAILCHIMP_STORE_INFO_SUBMIT_FAILURE:
			const error =
				WOOCOMMERCE_MAILCHIMP_STORE_INFO_SUBMIT_FAILURE === action.type ? action.error : false;
			return error;
	}

	return state;
}

/**
 * Updates state with lists request status
 *
 * @param  {object} state  Current state
 * @param  {object} action Action
 * @returns {object}        Updated state
 */
function listsRequest( state = false, { type } ) {
	switch ( type ) {
		case WOOCOMMERCE_MAILCHIMP_LISTS_REQUEST:
		case WOOCOMMERCE_MAILCHIMP_LISTS_REQUEST_SUCCESS:
		case WOOCOMMERCE_MAILCHIMP_LISTS_REQUEST_FAILURE:
			return WOOCOMMERCE_MAILCHIMP_LISTS_REQUEST === type;
	}

	return state;
}

/**
 * Updates state with list request error
 * Holds information only for latest request
 *
 * @param  {object} state  Current state
 * @param  {object} action Action
 * @returns {object}        Updated state
 */
function listsRequestError( state = false, action ) {
	switch ( action.type ) {
		case WOOCOMMERCE_MAILCHIMP_LISTS_REQUEST_SUCCESS:
		case WOOCOMMERCE_MAILCHIMP_LISTS_REQUEST_FAILURE:
			const error =
				WOOCOMMERCE_MAILCHIMP_LISTS_REQUEST_FAILURE === action.type ? action.error : false;
			return error;
	}

	return state;
}

/**
 * Updates state with newsletter submit status
 *
 * @param  {object} state  Current state
 * @param  {object} action Action
 * @returns {object}        Updated state
 */
function newsletterSettingsSubmit( state = false, { type } ) {
	switch ( type ) {
		case WOOCOMMERCE_MAILCHIMP_NEWSLETTER_SETTINGS_SUBMIT:
		case WOOCOMMERCE_MAILCHIMP_NEWSLETTER_SETTINGS_SUBMIT_SUCCESS:
		case WOOCOMMERCE_MAILCHIMP_NEWSLETTER_SETTINGS_SUBMIT_FAILURE:
			return WOOCOMMERCE_MAILCHIMP_NEWSLETTER_SETTINGS_SUBMIT === type;
	}

	return state;
}

/**
 * Updates state with newsletter settings submit error
 * Holds information only for latest request
 *
 * @param  {object} state  Current state
 * @param  {object} action Action
 * @returns {object}        Updated state
 */
function newsletterSettingsSubmitError( state = false, action ) {
	switch ( action.type ) {
		case WOOCOMMERCE_MAILCHIMP_NEWSLETTER_SETTINGS_SUBMIT_SUCCESS:
		case WOOCOMMERCE_MAILCHIMP_NEWSLETTER_SETTINGS_SUBMIT_FAILURE:
			const error =
				WOOCOMMERCE_MAILCHIMP_NEWSLETTER_SETTINGS_SUBMIT_FAILURE === action.type
					? action.error
					: false;
			return error;
	}

	return state;
}

/**
 * Updates state with save settings request status
 * The name ( saveSettings ) is generic because in future this should repond
 * also to other events than newsletter settings
 *
 * @param  {object} state  Current state
 * @param  {object} action Action
 * @returns {object}        Updated state
 */
function saveSettings( state = false, { type } ) {
	switch ( type ) {
		case WOOCOMMERCE_MAILCHIMP_SAVE_SETTINGS:
			return true;
		case WOOCOMMERCE_MAILCHIMP_NEWSLETTER_SETTINGS_SUBMIT_SUCCESS:
		case WOOCOMMERCE_MAILCHIMP_NEWSLETTER_SETTINGS_SUBMIT_FAILURE:
			return false;
	}

	return state;
}

export default combineReducers( {
	settings,
	settingsRequest,
	settingsRequestError,
	syncStatus,
	syncStatusRequest,
	syncStatusRequestError,
	resyncRequest,
	resyncRequestError,
	apiKeySubmit,
	apiKeySubmitError,
	storeInfoSubmit,
	storeInfoSubmitError,
	listsRequest,
	listsRequestError,
	newsletterSettingsSubmit,
	newsletterSettingsSubmitError,
	saveSettings,
} );
