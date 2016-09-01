/**
 * External dependencies
 */
import omit from 'lodash/omit';

/**
 * Internal dependencies
 */
import {
	PLUGIN_ACTIVATE_REQUEST,
	PLUGIN_ACTIVATE_REQUEST_SUCCESS,
	PLUGIN_ACTIVATE_REQUEST_FAILURE,
	PLUGIN_DEACTIVATE_REQUEST,
	PLUGIN_DEACTIVATE_REQUEST_SUCCESS,
	PLUGIN_DEACTIVATE_REQUEST_FAILURE,
	PLUGIN_UPDATE_REQUEST,
	PLUGIN_UPDATE_REQUEST_SUCCESS,
	PLUGIN_UPDATE_REQUEST_FAILURE,
	PLUGIN_AUTOUPDATE_ENABLE_REQUEST,
	PLUGIN_AUTOUPDATE_ENABLE_REQUEST_SUCCESS,
	PLUGIN_AUTOUPDATE_ENABLE_REQUEST_FAILURE,
	PLUGIN_AUTOUPDATE_DISABLE_REQUEST,
	PLUGIN_AUTOUPDATE_DISABLE_REQUEST_SUCCESS,
	PLUGIN_AUTOUPDATE_DISABLE_REQUEST_FAILURE,
	PLUGIN_INSTALL_REQUEST,
	PLUGIN_INSTALL_REQUEST_SUCCESS,
	PLUGIN_INSTALL_REQUEST_FAILURE,
	PLUGIN_REMOVE_REQUEST,
	PLUGIN_REMOVE_REQUEST_SUCCESS,
	PLUGIN_REMOVE_REQUEST_FAILURE,
	PLUGIN_NOTICE_REMOVE,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';

/*
 * Tracks all known installed plugin objects indexed by site ID.
 */
export default function logs( state = {}, action ) {
	const { siteId, pluginId } = action;
	switch ( action.type ) {
		case PLUGIN_ACTIVATE_REQUEST:
		case PLUGIN_DEACTIVATE_REQUEST:
		case PLUGIN_UPDATE_REQUEST:
		case PLUGIN_AUTOUPDATE_ENABLE_REQUEST:
		case PLUGIN_AUTOUPDATE_DISABLE_REQUEST:
		case PLUGIN_INSTALL_REQUEST:
		case PLUGIN_REMOVE_REQUEST:
		case PLUGIN_ACTIVATE_REQUEST_SUCCESS:
		case PLUGIN_DEACTIVATE_REQUEST_SUCCESS:
		case PLUGIN_UPDATE_REQUEST_SUCCESS:
		case PLUGIN_AUTOUPDATE_ENABLE_REQUEST_SUCCESS:
		case PLUGIN_AUTOUPDATE_DISABLE_REQUEST_SUCCESS:
		case PLUGIN_INSTALL_REQUEST_SUCCESS:
		case PLUGIN_REMOVE_REQUEST_SUCCESS:
		case PLUGIN_ACTIVATE_REQUEST_FAILURE:
		case PLUGIN_DEACTIVATE_REQUEST_FAILURE:
		case PLUGIN_UPDATE_REQUEST_FAILURE:
		case PLUGIN_AUTOUPDATE_ENABLE_REQUEST_FAILURE:
		case PLUGIN_AUTOUPDATE_DISABLE_REQUEST_FAILURE:
		case PLUGIN_INSTALL_REQUEST_FAILURE:
		case PLUGIN_REMOVE_REQUEST_FAILURE:
			if ( state.hasOwnProperty( siteId ) ) {
				return Object.assign( {}, state, {
					[ action.siteId ]: logsForSite( state[ siteId ], action )
				} );
			}
			return Object.assign( {}, state, { [ siteId ]: logsForSite( {}, action ) } );
		case PLUGIN_NOTICE_REMOVE:
			if ( state.hasOwnProperty( siteId ) && state[ siteId ].hasOwnProperty( pluginId ) ) {
				return Object.assign( {}, state, { [ siteId ]: omit( state[ siteId ], pluginId ) } );
			}
			return state;
		case SERIALIZE:
		case DESERIALIZE:
			return {};
		default:
			return state;
	}
}

function logsForSite( state = {}, action ) {
	const { pluginId } = action;
	switch ( action.type ) {
		case PLUGIN_ACTIVATE_REQUEST:
		case PLUGIN_DEACTIVATE_REQUEST:
		case PLUGIN_UPDATE_REQUEST:
		case PLUGIN_AUTOUPDATE_ENABLE_REQUEST:
		case PLUGIN_AUTOUPDATE_DISABLE_REQUEST:
		case PLUGIN_INSTALL_REQUEST:
		case PLUGIN_REMOVE_REQUEST:
		case PLUGIN_ACTIVATE_REQUEST_SUCCESS:
		case PLUGIN_DEACTIVATE_REQUEST_SUCCESS:
		case PLUGIN_UPDATE_REQUEST_SUCCESS:
		case PLUGIN_AUTOUPDATE_ENABLE_REQUEST_SUCCESS:
		case PLUGIN_AUTOUPDATE_DISABLE_REQUEST_SUCCESS:
		case PLUGIN_INSTALL_REQUEST_SUCCESS:
		case PLUGIN_REMOVE_REQUEST_SUCCESS:
		case PLUGIN_ACTIVATE_REQUEST_FAILURE:
		case PLUGIN_DEACTIVATE_REQUEST_FAILURE:
		case PLUGIN_UPDATE_REQUEST_FAILURE:
		case PLUGIN_AUTOUPDATE_ENABLE_REQUEST_FAILURE:
		case PLUGIN_AUTOUPDATE_DISABLE_REQUEST_FAILURE:
		case PLUGIN_INSTALL_REQUEST_FAILURE:
		case PLUGIN_REMOVE_REQUEST_FAILURE:
			if ( typeof state[ pluginId ] !== 'undefined' ) {
				return Object.assign( {}, state, {
					[ pluginId ]: logsForSitePlugin( state[ pluginId ], action )
				} );
			}
			return Object.assign( {}, state, { [ pluginId ]: logsForSitePlugin( {}, action ) } );
		default:
			return state;
	}
}

function logsForSitePlugin( state = {}, action ) {
	switch ( action.type ) {
		case PLUGIN_ACTIVATE_REQUEST:
		case PLUGIN_DEACTIVATE_REQUEST:
		case PLUGIN_UPDATE_REQUEST:
		case PLUGIN_AUTOUPDATE_ENABLE_REQUEST:
		case PLUGIN_AUTOUPDATE_DISABLE_REQUEST:
		case PLUGIN_INSTALL_REQUEST:
		case PLUGIN_REMOVE_REQUEST:
			return Object.assign( {}, state, { status: 'inProgress', action: action.action } );
		case PLUGIN_ACTIVATE_REQUEST_SUCCESS:
		case PLUGIN_DEACTIVATE_REQUEST_SUCCESS:
		case PLUGIN_UPDATE_REQUEST_SUCCESS:
		case PLUGIN_AUTOUPDATE_ENABLE_REQUEST_SUCCESS:
		case PLUGIN_AUTOUPDATE_DISABLE_REQUEST_SUCCESS:
		case PLUGIN_INSTALL_REQUEST_SUCCESS:
		case PLUGIN_REMOVE_REQUEST_SUCCESS:
			return Object.assign( {}, state, { status: 'completed', action: action.action } );
		case PLUGIN_ACTIVATE_REQUEST_FAILURE:
		case PLUGIN_DEACTIVATE_REQUEST_FAILURE:
		case PLUGIN_UPDATE_REQUEST_FAILURE:
		case PLUGIN_AUTOUPDATE_ENABLE_REQUEST_FAILURE:
		case PLUGIN_AUTOUPDATE_DISABLE_REQUEST_FAILURE:
		case PLUGIN_INSTALL_REQUEST_FAILURE:
		case PLUGIN_REMOVE_REQUEST_FAILURE:
			return Object.assign( {}, state, { status: 'error', action: action.action, error: action.error } );
		default:
			return state;
	}
}
