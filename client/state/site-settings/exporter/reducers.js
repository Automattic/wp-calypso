/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	EXPORT_ADVANCED_SETTINGS_FAIL,
	EXPORT_ADVANCED_SETTINGS_FETCH,
	EXPORT_ADVANCED_SETTINGS_RECEIVE,
	EXPORT_POST_TYPE_SET,
	EXPORT_POST_TYPE_FIELD_SET,
	SERIALIZE,
	DESERIALIZE,
	EXPORT_CLEAR,
	EXPORT_COMPLETE,
	EXPORT_START_REQUEST,
	EXPORT_STARTED,
	EXPORT_FAILURE
} from 'state/action-types';

import { States } from './constants';

export function selectedPostType( state = null, action ) {
	switch ( action.type ) {
		case EXPORT_POST_TYPE_SET:
			return action.postType;
		case SERIALIZE:
			return null;
		case DESERIALIZE:
			return null;
	}
	return state;
}

const postTypeField = ( state = '', action ) => {
	switch ( action.type ) {
		case EXPORT_POST_TYPE_FIELD_SET:
			return Object.assign( {}, state, {
				[ action.fieldName ]: action.value
			} );
	}
	return state;
};

const postTypes = ( state = { post: {}, page: {} }, action ) => {
	switch ( action.type ) {
		case EXPORT_POST_TYPE_FIELD_SET:
			return Object.assign( {}, state, {
				[ action.postType ]: postTypeField( state[ action.postType ], action )
			} );
	}
	return state;
};

export function selectedAdvancedSettings( state = {}, action ) {
	switch ( action.type ) {
		case EXPORT_POST_TYPE_FIELD_SET:
			return Object.assign( {}, state, {
				[ action.siteId ]: postTypes( state[ action.siteId ], action )
			} );
		case SERIALIZE:
			return {};
		case DESERIALIZE:
			return {};
	}
	return state;
}

/**
 * Tracks the state of the exporter for each site ID
 * @param  {Object} state  The current state
 * @param  {Object} action Action object
 * @return {Object}        Updated state
 */
export function exportingState( state = {}, { type, siteId } ) {
	switch ( type ) {
		case EXPORT_START_REQUEST:
			return Object.assign( {}, state, {
				[ siteId ]: States.STARTING
			} );
		case EXPORT_STARTED:
			return Object.assign( {}, state, {
				[ siteId ]: States.EXPORTING
			} );
		case EXPORT_COMPLETE:
			return Object.assign( {}, state, {
				[ siteId ]: States.COMPLETE
			} );
		case EXPORT_FAILURE:
			return Object.assign( {}, state, {
				[ siteId ]: States.FAILED
			} );
		case EXPORT_CLEAR:
			return Object.assign( {}, state, {
				[ siteId ]: States.READY
			} );
		case SERIALIZE:
			return {};
		case DESERIALIZE:
			return {};
	}
	return state;
}

/**
 * Tracks whether the advanced settings for a site are currently being fetched
 * @param  {Object} state  Current global state tree
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function fetchingAdvancedSettings( state = {}, action ) {
	switch ( action.type ) {
		case EXPORT_ADVANCED_SETTINGS_FETCH:
			return Object.assign( {}, state, {
				[ action.siteId ]: true
			} );
		case EXPORT_ADVANCED_SETTINGS_FAIL:
		case EXPORT_ADVANCED_SETTINGS_RECEIVE:
			return Object.assign( {}, state, {
				[ action.siteId ]: false
			} );
		case SERIALIZE:
			return {};
		case DESERIALIZE:
			return {};
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
			return {};
		case DESERIALIZE:
			return {};
	}
	return state;
}

export function downloadURL( state = null, action ) {
	switch ( action.type ) {
		case EXPORT_COMPLETE:
			return action.downloadURL;
		case EXPORT_CLEAR:
			return null;
		case SERIALIZE:
			return null;
		case DESERIALIZE:
			return null;
	}

	return state;
}

export default combineReducers( {
	selectedPostType,
	selectedAdvancedSettings,
	exportingState,
	fetchingAdvancedSettings,
	advancedSettings,
	downloadURL,
} );
