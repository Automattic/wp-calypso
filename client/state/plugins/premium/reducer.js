/**
* External dependencies
*/
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	PLUGIN_SETUP_FETCH_INSTRUCTIONS,
	PLUGIN_SETUP_RECEIVE_INSTRUCTIONS,
	PLUGIN_SETUP_START,
	PLUGIN_SETUP_INSTALL,
	PLUGIN_SETUP_ACTIVATE,
	PLUGIN_SETUP_CONFIGURE,
	PLUGIN_SETUP_FINISH,
	PLUGIN_SETUP_ALL_FINISH,
	PLUGIN_SETUP_ERROR
} from 'state/action-types';

export function isRequesting( state = false, action ) {
	switch ( action.type ) {
		case PLUGIN_SETUP_FETCH_INSTRUCTIONS:
			return Object.assign( {}, state, { [ action.siteId ]: true } );
		case PLUGIN_SETUP_RECEIVE_INSTRUCTIONS:
			return Object.assign( {}, state, { [ action.siteId ]: false } );
		default:
			return state;
	}
}

function pluginStatus( state, action ) {
	switch ( action.type ) {
		case PLUGIN_SETUP_START:
			return Object.assign( {}, state, {
				start: true,
			} );
		case PLUGIN_SETUP_INSTALL:
			return Object.assign( {}, state, {
				start: true,
				install: true,
			} );
		case PLUGIN_SETUP_ACTIVATE:
			return Object.assign( {}, state, {
				start: true,
				install: false,
				activate: true,
			} );
		case PLUGIN_SETUP_CONFIGURE:
			return Object.assign( {}, state, {
				start: true,
				activate: false,
				config: true,
			} );
		case PLUGIN_SETUP_FINISH:
			return Object.assign( {}, state, {
				start: true,
				config: false,
				done: true,
			} );
		case PLUGIN_SETUP_ALL_FINISH:
			return Object.assign( {}, state, {
				start: false,
			} );
		default:
			return state;
	}
}

function plugin( state, action ) {
	switch ( action.type ) {
		case PLUGIN_SETUP_START:
			if ( state.slug !== action.slug ) {
				if ( state.status.start ) {
					return Object.assign( {}, state, {
						status: Object.assign( {}, state.status, { start: false } )
					} );
				}
				return state;
			}
			return Object.assign( {}, state, {
				status: pluginStatus( state.status, action )
			} );
		case PLUGIN_SETUP_INSTALL:
		case PLUGIN_SETUP_ACTIVATE:
		case PLUGIN_SETUP_CONFIGURE:
		case PLUGIN_SETUP_FINISH:
		case PLUGIN_SETUP_ALL_FINISH:
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

function pluginsForSite( state = [], action ) {
	switch ( action.type ) {
		case PLUGIN_SETUP_RECEIVE_INSTRUCTIONS:
			return action.data;
		case PLUGIN_SETUP_START:
		case PLUGIN_SETUP_INSTALL:
		case PLUGIN_SETUP_ACTIVATE:
		case PLUGIN_SETUP_CONFIGURE:
		case PLUGIN_SETUP_FINISH:
		case PLUGIN_SETUP_ALL_FINISH:
		case PLUGIN_SETUP_ERROR:
			return state.map( p => plugin( p, action ) );
		default:
			return state;
	}
}

export function plugins( state = {}, action ) {
	switch ( action.type ) {
		case PLUGIN_SETUP_RECEIVE_INSTRUCTIONS:
			return Object.assign( {}, state, { [ action.siteId ]: action.data } );
		case PLUGIN_SETUP_START:
		case PLUGIN_SETUP_INSTALL:
		case PLUGIN_SETUP_ACTIVATE:
		case PLUGIN_SETUP_CONFIGURE:
		case PLUGIN_SETUP_FINISH:
		case PLUGIN_SETUP_ALL_FINISH:
		case PLUGIN_SETUP_ERROR:
			if ( typeof state[ action.siteId ] !== 'undefined' ) {
				return Object.assign( {}, state, {
					[ action.siteId ]: pluginsForSite( state[ action.siteId ], action )
				} );
			}
			return state;
		default:
			return state;
	}
}

export default combineReducers( {
	isRequesting,
	plugins
} );
