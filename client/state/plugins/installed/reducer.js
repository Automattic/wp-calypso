/* eslint-disable no-case-declarations */
/**
 * External dependencies
 */
import { omit, findIndex } from 'lodash';
/**
 * Internal dependencies
 */
import status from './status/reducer';
import { combineReducers, withSchemaValidation } from 'state/utils';
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
} from 'state/action-types';
import { pluginsSchema } from './schema';

/*
 * Tracks the requesting state for installed plugins on a per-site index.
 */
export function isRequesting( state = {}, action ) {
	switch ( action.type ) {
		case PLUGINS_REQUEST:
			return Object.assign( {}, state, { [ action.siteId ]: true } );
		case PLUGINS_REQUEST_FAILURE:
		case PLUGINS_REQUEST_SUCCESS:
			return Object.assign( {}, state, { [ action.siteId ]: false } );
		default:
			return state;
	}
}

/*
 * Helper function to update a plugin's state after a successful plugin action
 * (multiple action-types are possible)
 */
const updatePlugin = function ( state, action ) {
	if ( typeof state[ action.siteId ] !== 'undefined' ) {
		return Object.assign( {}, state, {
			[ action.siteId ]: pluginsForSite( state[ action.siteId ], action ),
		} );
	}
	return state;
};

/*
 * Tracks all known installed plugin objects indexed by site ID.
 */
export const plugins = withSchemaValidation( pluginsSchema, ( state = {}, action ) => {
	switch ( action.type ) {
		case PLUGINS_RECEIVE: {
			return { ...state, [ action.siteId ]: action.data };
		}
		case PLUGIN_ACTIVATE_REQUEST_SUCCESS:
			return updatePlugin( state, action );
		case PLUGIN_DEACTIVATE_REQUEST_SUCCESS:
			return updatePlugin( state, action );
		case PLUGIN_UPDATE_REQUEST_SUCCESS:
			return updatePlugin( state, action );
		case PLUGIN_AUTOUPDATE_ENABLE_REQUEST_SUCCESS:
			return updatePlugin( state, action );
		case PLUGIN_AUTOUPDATE_DISABLE_REQUEST_SUCCESS:
			return updatePlugin( state, action );
		case PLUGIN_INSTALL_REQUEST_SUCCESS:
			return updatePlugin( state, action );
		case PLUGIN_REMOVE_REQUEST_SUCCESS:
			return updatePlugin( state, action );
	}

	return state;
} );

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
			return state.map( ( p ) => plugin( p, action ) );
		case PLUGIN_INSTALL_REQUEST_SUCCESS:
			return [ ...state, action.data ];
		case PLUGIN_REMOVE_REQUEST_SUCCESS:
			const index = findIndex( state, { id: action.pluginId } );
			return [ ...state.slice( 0, index ), ...state.slice( index + 1 ) ];
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
	plugins,
	status,
} );
