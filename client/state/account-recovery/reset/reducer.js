/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import { pick } from 'lodash';

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import {
	ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR,
	ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE,
	ACCOUNT_RECOVERY_RESET_OPTIONS_REQUEST,
	ACCOUNT_RECOVERY_RESET_UPDATE_USER_DATA,
	ACCOUNT_RECOVERY_RESET_TRANSIT_TO_ROUTE,
} from 'state/action-types';

import { ACCOUNT_RECOVERY_ROUTES } from './constants';

const options = combineReducers( {
	isRequesting: createReducer( false, {
		[ ACCOUNT_RECOVERY_RESET_OPTIONS_REQUEST ]: () => true,
		[ ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE ]: () => false,
		[ ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR ]: () => false,
	} ),

	error: createReducer( null, {
		[ ACCOUNT_RECOVERY_RESET_OPTIONS_REQUEST ]: () => null,
		[ ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE ]: () => null,
		[ ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR ]: ( state, { error } ) => error,
	} ),

	items: createReducer( [], {
		[ ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE ]: ( state, { items } ) => items,
		[ ACCOUNT_RECOVERY_RESET_OPTIONS_REQUEST ]: () => [],
		[ ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR ]: () => [],
	} ),
} );

const validUserDataProps = [ 'user', 'firstName', 'lastName', 'url' ];

const userData = createReducer( {}, {
	[ ACCOUNT_RECOVERY_RESET_UPDATE_USER_DATA ]: ( state, action ) => ( {
		...state,
		...pick( action.userData, validUserDataProps ),
	} ),
} );

const currentRoute = createReducer( ACCOUNT_RECOVERY_ROUTES.ROOT, {
	[ ACCOUNT_RECOVERY_RESET_TRANSIT_TO_ROUTE ]: ( state, { route } ) => route,
} );

export default combineReducers( {
	options,
	userData,
	currentRoute,
} );
