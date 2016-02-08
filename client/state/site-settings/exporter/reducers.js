/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	EXPORT_ADVANCED_SETTINGS_RECEIVE,
	SET_EXPORT_POST_TYPE,
	REQUEST_START_EXPORT,
	REPLY_START_EXPORT,
	FAIL_EXPORT,
	COMPLETE_EXPORT,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';

import { States } from './constants';

export function selectedPostType( state = null, action ) {
	switch ( action.type ) {
		case SET_EXPORT_POST_TYPE:
			return action.postType;
		case SERIALIZE:
			return state;
		case DESERIALIZE:
			return state;
	}
	return state;
}

export function exportingState( state = States.READY, action ) {
	switch ( action.type ) {
		case REQUEST_START_EXPORT:
			return States.STARTING;
		case REPLY_START_EXPORT:
			return States.EXPORTING;
		case FAIL_EXPORT:
		case COMPLETE_EXPORT:
			return States.READY;
		case SERIALIZE:
			return state;
		case DESERIALIZE:
			return States.READY;
	}
	return state;
}

/**
 * Tracks available advanced settings for sites.
 * @param  {Object} state  Current global state tree
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function advancedSettings( state = {}, action ) {
	switch ( action.type ) {
		case EXPORT_ADVANCED_SETTINGS_RECEIVE:
			return Object.assign( {}, state, {
				[ action.siteId ]: action.advancedSettings
			} );
		case SERIALIZE:
			return state;
		case DESERIALIZE:
			return state;
	}

	return state;
}

export default combineReducers( {
	selectedPostType,
	exportingState,
	advancedSettings
} );
