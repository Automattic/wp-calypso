/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import uniqBy from 'lodash/uniqBy';
import omit from 'lodash/omit';
import findIndex from 'lodash/findIndex';
/**
 * Internal dependencies
 */
import status from './status/reducer';
import {
	PLUGINS_RECEIVE,
	PLUGINS_REQUEST,
	PLUGINS_REQUEST_SUCCESS,
	PLUGINS_REQUEST_FAILURE,
	PLUGIN_ACTIVATE_REQUEST_SUCCESS,
	PLUGIN_DEACTIVATE_REQUEST_SUCCESS,
	PLUGIN_UPDATE_REQUEST_SUCCESS,
	PLUGIN_AUTOUPDATE_ENABLE_REQUEST_SUCCESS,
	PLUGIN_AUTOUPDATE_DISABLE_REQUEST_SUCCESS,
	PLUGIN_INSTALL_REQUEST_SUCCESS,
	PLUGIN_REMOVE_REQUEST_SUCCESS,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';

/*
 * Tracks the requesting state for installed plugins on a per-site index.
 */
export function isRequesting( state = {}, action ) {
	switch ( action.type ) {
		case PLUGINS_REQUEST:
			return Object.assign( {}, state, { [ action.siteId ]: true } );
		case PLUGINS_RECEIVE:
			return Object.assign( {}, state, { [ action.siteId ]: false } );
		case SERIALIZE:
		case DESERIALIZE:
			return {};
		default:
			return state;
	}
}

/*
 * Tracks the requesting state for installed plugins on a per-site index.
 */
export function hasRequested( state = {}, action ) {
	switch ( action.type ) {
		case PLUGINS_REQUEST:
			return Object.assign( {}, state, { [ action.siteId ]: true } );
		case SERIALIZE:
		case DESERIALIZE:
			return {};
		default:
			return state;
	}
}

/*
 * Tracks all known installed plugin objects indexed by site ID.
 */
export function plugins( state = {}, action ) {
	switch ( action.type ) {
		case PLUGINS_REQUEST_SUCCESS:
			const pluginData = uniqBy( action.data, 'slug' );
			return Object.assign( {}, state, { [ action.siteId ]: pluginData } );
		case PLUGINS_REQUEST_FAILURE:
			return Object.assign( {}, state, { [ action.siteId ]: [] } );
		case PLUGIN_ACTIVATE_REQUEST_SUCCESS:
		case PLUGIN_DEACTIVATE_REQUEST_SUCCESS:
		case PLUGIN_UPDATE_REQUEST_SUCCESS:
		case PLUGIN_AUTOUPDATE_ENABLE_REQUEST_SUCCESS:
		case PLUGIN_AUTOUPDATE_DISABLE_REQUEST_SUCCESS:
		case PLUGIN_INSTALL_REQUEST_SUCCESS:
		case PLUGIN_REMOVE_REQUEST_SUCCESS:
			if ( typeof state[ action.siteId ] !== 'undefined' ) {
				return Object.assign( {}, state, {
					[ action.siteId ]: pluginsForSite( state[ action.siteId ], action )
				} );
			}
			return state;
		case SERIALIZE:
		case DESERIALIZE:
			return {};
		default:
			return state;
	}
}

/*
 * Tracks the list of premium plugin objects for a single site
 */
function pluginsForSite( state = [], action ) {
	switch ( action.type ) {
		case PLUGIN_ACTIVATE_REQUEST_SUCCESS:
		case PLUGIN_DEACTIVATE_REQUEST_SUCCESS:
		case PLUGIN_UPDATE_REQUEST_SUCCESS:
		case PLUGIN_AUTOUPDATE_ENABLE_REQUEST_SUCCESS:
		case PLUGIN_AUTOUPDATE_DISABLE_REQUEST_SUCCESS:
			return state.map( p => plugin( p, action ) );
		case PLUGIN_INSTALL_REQUEST_SUCCESS:
			return [
				...state,
				action.data
			];
		case PLUGIN_REMOVE_REQUEST_SUCCESS:
			const index = findIndex( state, { id: action.pluginId } );
			return [
				...state.slice( 0, index ),
				...state.slice( index + 1 )
			];
		default:
			return state;
	}
}

/*
 * Tracks the state of a single premium plugin object
 */
function plugin( state, action ) {
	switch ( action.type ) {
		case PLUGIN_ACTIVATE_REQUEST_SUCCESS:
		case PLUGIN_DEACTIVATE_REQUEST_SUCCESS:
		case PLUGIN_AUTOUPDATE_ENABLE_REQUEST_SUCCESS:
		case PLUGIN_AUTOUPDATE_DISABLE_REQUEST_SUCCESS:
			if ( state.id !== action.data.id ) {
				return state;
			}
			return Object.assign( {}, state, action.data );
		case PLUGIN_UPDATE_REQUEST_SUCCESS:
			if ( state.id !== action.data.id ) {
				return state;
			}
			return Object.assign( {}, omit( state, 'update' ), action.data );
		default:
			return state;
	}
}

export default combineReducers( {
	isRequesting,
	hasRequested,
	plugins,
	status
} );
