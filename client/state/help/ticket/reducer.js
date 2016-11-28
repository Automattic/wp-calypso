/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';

import {
	HELP_TICKET_CONFIGURATION_REQUEST,
	HELP_TICKET_CONFIGURATION_REQUEST_SUCCESS,
	HELP_TICKET_CONFIGURATION_REQUEST_FAILURE,
} from 'state/action-types';

const isRequesting = createReducer( false, {
	[ HELP_TICKET_CONFIGURATION_REQUEST ]: () => true,
	[ HELP_TICKET_CONFIGURATION_REQUEST_SUCCESS ]: () => false,
	[ HELP_TICKET_CONFIGURATION_REQUEST_FAILURE ]: () => false,
} );

const isUserEligible = createReducer( false, {
	[ HELP_TICKET_CONFIGURATION_REQUEST_SUCCESS ]: ( state, { is_user_eligible } ) => is_user_eligible,
} );

const isReady = createReducer( false, {
	[ HELP_TICKET_CONFIGURATION_REQUEST_SUCCESS ]: () => true,
	[ HELP_TICKET_CONFIGURATION_REQUEST_FAILURE ]: () => true,
} );

export default combineReducers( {
	isReady,
	isRequesting,
	isUserEligible,
} );
