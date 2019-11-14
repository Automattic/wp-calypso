/**
 * Internal dependencies
 */

import { combineReducers, withoutPersistence } from 'state/utils';
import {
	HELP_TICKET_CONFIGURATION_REQUEST,
	HELP_TICKET_CONFIGURATION_REQUEST_SUCCESS,
	HELP_TICKET_CONFIGURATION_REQUEST_FAILURE,
	HELP_TICKET_CONFIGURATION_DISMISS_ERROR,
} from 'state/action-types';

const isRequesting = withoutPersistence( ( state = false, action ) => {
	switch ( action.type ) {
		case HELP_TICKET_CONFIGURATION_REQUEST:
			return true;
		case HELP_TICKET_CONFIGURATION_REQUEST_SUCCESS:
			return false;
		case HELP_TICKET_CONFIGURATION_REQUEST_FAILURE:
			return false;
	}

	return state;
} );

const isUserEligible = withoutPersistence( ( state = false, action ) => {
	switch ( action.type ) {
		case HELP_TICKET_CONFIGURATION_REQUEST_SUCCESS: {
			const { configuration } = action;
			return configuration.is_user_eligible;
		}
	}

	return state;
} );

const isReady = withoutPersistence( ( state = false, action ) => {
	switch ( action.type ) {
		case HELP_TICKET_CONFIGURATION_REQUEST_SUCCESS:
			return true;
	}

	return state;
} );

const requestError = withoutPersistence( ( state = null, action ) => {
	switch ( action.type ) {
		case HELP_TICKET_CONFIGURATION_REQUEST:
			return null;
		case HELP_TICKET_CONFIGURATION_REQUEST_SUCCESS:
			return null;
		case HELP_TICKET_CONFIGURATION_REQUEST_FAILURE: {
			const { error } = action;
			return error;
		}
		case HELP_TICKET_CONFIGURATION_DISMISS_ERROR:
			return null;
	}

	return state;
} );

export default combineReducers( {
	isReady,
	isRequesting,
	isUserEligible,
	requestError,
} );
