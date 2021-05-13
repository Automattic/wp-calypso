/**
 * External dependencies
 */
import { mapValues, omit } from 'lodash';

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
} from 'calypso/state/action-types';
import { combineReducers, withSchemaValidation, withPersistence } from 'calypso/state/utils';
import { pluginInstructionSchema } from './schema';

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
		default:
			return state;
	}
}

/*
 * Tracks all known premium plugin objects (plugin meta and install status),
 * indexed by site ID.
 */
const pluginsReducer = ( state = {}, action ) => {
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
					[ action.siteId ]: pluginsForSite( state[ action.siteId ], action ),
				} );
			}
			return state;
		default:
			return state;
	}
};

// pick selected properties from the error object and ignore ones that are `undefined`.
const serializeError = ( error ) =>
	Object.fromEntries(
		[ 'name', 'code', 'error', 'message' ]
			.map( ( k ) => [ k, error[ k ] ] )
			.filter( ( [ , v ] ) => v !== undefined )
	);

export const plugins = withSchemaValidation(
	pluginInstructionSchema,
	withPersistence( pluginsReducer, {
		// - save only selected fields of an error (an `Error` instance is not serializable per se)
		// - omit the `key` field.
		serialize: ( state ) =>
			mapValues( state, ( pluginList ) =>
				pluginList.map( ( item ) => {
					if ( item.error ) {
						item = {
							...item,
							error: serializeError( item.error ),
						};
					}
					return omit( item, 'key' );
				} )
			),
	} )
);

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
			return state.map( ( p ) => plugin( p, action ) );
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
				status: pluginStatus( state.status, action ),
			} );
		case PLUGIN_SETUP_ERROR:
			if ( state.slug !== action.slug ) {
				return state;
			}
			return Object.assign( {}, state, {
				status: pluginStatus( state.status, action ),
				error: action.error,
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
	plugins,
} );
