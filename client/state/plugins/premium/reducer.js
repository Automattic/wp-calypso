/**
* External dependencies
*/
import { combineReducers } from 'redux';
import forEach from 'lodash/forEach';

/**
 * Internal dependencies
 */
import {
	PLUGIN_SETUP_INSTRUCTIONS_FETCH,
	PLUGIN_SETUP_INSTRUCTIONS_RECEIVE,
	PLUGIN_SETUP_INSTALL,
	PLUGIN_SETUP_ACTIVATE,
	PLUGIN_SETUP_CONFIGURE,
	PLUGIN_SETUP_FINISH,
	PLUGIN_SETUP_ERROR,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';
import { pluginInstructionSchema } from './schema';
import { isValidStateWithSchema } from 'state/utils';

/*
 * Tracks the requesting state for premium plugin "instructions" (the list
 * of plugins and API keys) on a per-site index.
 */
export function isRequesting( state = {}, action ) {
	switch ( action.type ) {
		case PLUGIN_SETUP_INSTRUCTIONS_FETCH:
			return Object.assign( {}, state, { [ action.siteId ]: true } );
		case PLUGIN_SETUP_INSTRUCTIONS_RECEIVE:
			return Object.assign( {}, state, { [ action.siteId ]: false } );
		case SERIALIZE:
		case DESERIALIZE:
			return {};
		default:
			return state;
	}
}

/*
 * Tracks the requesting state for premium plugin "instructions" (the list
 * of plugins and API keys) on a per-site index.
 */
export function hasRequested( state = {}, action ) {
	switch ( action.type ) {
		case PLUGIN_SETUP_INSTRUCTIONS_RECEIVE:
			return Object.assign( {}, state, { [ action.siteId ]: true } );
		case SERIALIZE:
		case DESERIALIZE:
			return {};
		default:
			return state;
	}
}

/*
 * Tracks all known premium plugin objects (plugin meta and install status),
 * indexed by site ID.
 */
export function plugins( state = {}, action ) {
	switch ( action.type ) {
		case PLUGIN_SETUP_INSTRUCTIONS_RECEIVE:
			return Object.assign( {}, state, { [ action.siteId ]: action.data } );
		case PLUGIN_SETUP_INSTALL:
		case PLUGIN_SETUP_ACTIVATE:
		case PLUGIN_SETUP_CONFIGURE:
		case PLUGIN_SETUP_FINISH:
		case PLUGIN_SETUP_ERROR:
			if ( typeof state[ action.siteId ] !== 'undefined' ) {
				return Object.assign( {}, state, {
					[ action.siteId ]: pluginsForSite( state[ action.siteId ], action )
				} );
			}
			return state;
		case SERIALIZE:
			let processedState = {};
			// Save the error state as a string message.
			forEach( state, ( pluginList, key ) => {
				processedState[ key ] = pluginList.map( ( item ) => {
					if ( item.error !== null ) {
						return Object.assign( {}, item, { error: item.error.toString() } );
					}
					return item;
				} );
			} );
			return processedState;
		case DESERIALIZE:
			if ( ! isValidStateWithSchema( state, pluginInstructionSchema ) ) {
				return {};
			}
			return state;
		default:
			return state;
	}
}

/*
 * Tracks the list of premium plugin objects for a single site
 */
function pluginsForSite( state = [], action ) {
	switch ( action.type ) {
		case PLUGIN_SETUP_INSTRUCTIONS_RECEIVE:
			return action.data;
		case PLUGIN_SETUP_INSTALL:
		case PLUGIN_SETUP_ACTIVATE:
		case PLUGIN_SETUP_CONFIGURE:
		case PLUGIN_SETUP_FINISH:
		case PLUGIN_SETUP_ERROR:
			return state.map( p => plugin( p, action ) );
		default:
			return state;
	}
}

/*
 * Tracks the state of a single premium plugin object
 */
function plugin( state, action ) {
	switch ( action.type ) {
		case PLUGIN_SETUP_INSTALL:
		case PLUGIN_SETUP_ACTIVATE:
		case PLUGIN_SETUP_CONFIGURE:
		case PLUGIN_SETUP_FINISH:
			if ( state.slug !== action.slug ) {
				return state;
			}
			return Object.assign( {}, state, {
				status: pluginStatus( state.status, action )
			} );
		case PLUGIN_SETUP_ERROR:
			if ( state.slug !== action.slug ) {
				return state;
			}
			return Object.assign( {}, state, {
				status: pluginStatus( state.status, action ),
				error: action.error
			} );
		default:
			return state;
	}
}

/*
 * Tracks the status of a plugin through the install/activate/configure process
 */
function pluginStatus( state, action ) {
	switch ( action.type ) {
		case PLUGIN_SETUP_INSTALL:
			return 'install';
		case PLUGIN_SETUP_ACTIVATE:
			return 'activate';
		case PLUGIN_SETUP_CONFIGURE:
			return 'configure';
		case PLUGIN_SETUP_FINISH:
			return 'done';
		default:
			return state || 'wait';
	}
}

export default combineReducers( {
	isRequesting,
	hasRequested,
	plugins
} );
