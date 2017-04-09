/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import { mapValues, merge } from 'lodash';

/**
 * Internal dependencies
 */
import {
	JETPACK_MODULE_ACTIVATE_SUCCESS,
	JETPACK_MODULE_DEACTIVATE_SUCCESS,
	JETPACK_MODULES_RECEIVE,
	JETPACK_SETTINGS_RECEIVE,
	JETPACK_SETTINGS_REGENERATE_POST_BY_EMAIL,
	JETPACK_SETTINGS_REGENERATE_POST_BY_EMAIL_SUCCESS,
	JETPACK_SETTINGS_REGENERATE_POST_BY_EMAIL_FAILURE,
	JETPACK_SETTINGS_REQUEST,
	JETPACK_SETTINGS_REQUEST_FAILURE,
	JETPACK_SETTINGS_REQUEST_SUCCESS,
	JETPACK_SETTINGS_UPDATE,
	JETPACK_SETTINGS_UPDATE_SUCCESS,
	JETPACK_SETTINGS_UPDATE_FAILURE
} from 'state/action-types';
import { createReducer } from 'state/utils';
import { normalizeSettings } from './utils';

const createRequestsReducer = ( data ) => {
	return ( state, { siteId } ) => {
		return Object.assign( {}, state, {
			[ siteId ]: data
		} );
	};
};

const createItemsReducer = () => {
	return ( state, { siteId, settings } ) => {
		return merge( {}, state, {
			[ siteId ]: settings
		} );
	};
};

const createActivationItemsReducer = ( active ) => {
	return ( state, { siteId, moduleSlug } ) => {
		return Object.assign( {}, state, {
			[ siteId ]: {
				...state[ siteId ],
				[ moduleSlug ]: active,
			}
		} );
	};
};

/**
 * `Reducer` function which handles request/response actions
 * concerning Jetpack settings updates
 *
 * @param  {Array}  state  Current state
 * @param  {Object} action action
 * @return {Array}         Updated state
 */
export const items = createReducer( {}, {
	[ JETPACK_SETTINGS_RECEIVE ]: createItemsReducer(),
	[ JETPACK_SETTINGS_UPDATE_SUCCESS ]: createItemsReducer(),
	[ JETPACK_MODULE_ACTIVATE_SUCCESS ]: createActivationItemsReducer( true ),
	[ JETPACK_MODULE_DEACTIVATE_SUCCESS ]: createActivationItemsReducer( false ),
	[ JETPACK_MODULES_RECEIVE ]: ( state, { siteId, modules } ) => {
		const modulesActivationState = mapValues( modules, module => module.active );
		// The need for flattening module options into this moduleSettings is temporary.
		// Once https://github.com/Automattic/jetpack/pull/6002 is released,
		// the flattening will be done on the server side for the /jetpack/v4/settings/ endpoint
		const moduleSettings = Object.keys( modules ).reduce( ( allTheSettings, slug ) => {
			return { ...allTheSettings, ...mapValues( modules[ slug ].options, option => option.current_value ) };
		}, {} );
		return Object.assign( {}, state, {
			[ siteId ]: {
				...state[ siteId ],
				...modulesActivationState,
				...normalizeSettings( moduleSettings )
			}
		} );
	},
	[ JETPACK_SETTINGS_REGENERATE_POST_BY_EMAIL_SUCCESS ]: ( state, { siteId, email } ) => {
		return Object.assign( {}, state, {
			[ siteId ]: {
				...state[ siteId ],
				post_by_email_address: email
			}
		} );
	},
} );

/**
 * `Reducer` function which handles request/response actions
 * concerning Jetpack settings related requests
 *
 * @param {Object} state - current state
 * @param {Object} action - action
 * @return {Object} updated state
 */
export const requests = createReducer( {}, {
	[ JETPACK_SETTINGS_REQUEST ]: createRequestsReducer( { requesting: true } ),
	[ JETPACK_SETTINGS_REQUEST_FAILURE ]: createRequestsReducer( { requesting: false } ),
	[ JETPACK_SETTINGS_REQUEST_SUCCESS ]: createRequestsReducer( { requesting: false } ),
	[ JETPACK_SETTINGS_UPDATE ]: createRequestsReducer( { updating: true } ),
	[ JETPACK_SETTINGS_UPDATE_FAILURE ]: createRequestsReducer( { updating: false } ),
	[ JETPACK_SETTINGS_UPDATE_SUCCESS ]: createRequestsReducer( { updating: false } ),
	[ JETPACK_SETTINGS_REGENERATE_POST_BY_EMAIL ]: createRequestsReducer( { regeneratingPostByEmail: true } ),
	[ JETPACK_SETTINGS_REGENERATE_POST_BY_EMAIL_SUCCESS ]: createRequestsReducer( { regeneratingPostByEmail: false } ),
	[ JETPACK_SETTINGS_REGENERATE_POST_BY_EMAIL_FAILURE ]: createRequestsReducer( { regeneratingPostByEmail: false } ),
} );

/**
 * `Reducer` function which handles request/response actions
 * concerning Jetpack settings save requests
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const saveRequests = createReducer( {}, {
	[ JETPACK_SETTINGS_UPDATE ]: ( state, { siteId } ) => ( {
		...state,
		[ siteId ]: { saving: true, status: 'pending', error: false }
	} ),
	[ JETPACK_SETTINGS_UPDATE_SUCCESS ]: ( state, { siteId } ) => ( {
		...state,
		[ siteId ]: { saving: false, status: 'success', error: false }
	} ),
	[ JETPACK_SETTINGS_UPDATE_FAILURE ]: ( state, { siteId, error } ) => ( {
		...state,
		[ siteId ]: { saving: false, status: 'error', error }
	} )
} );

export const reducer = combineReducers( {
	items,
	requests,
	saveRequests
} );
