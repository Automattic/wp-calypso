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
	PLUGIN_ALREADY_UP_TO_DATE,
	PLUGIN_AUTOUPDATE_ENABLE_REQUEST,
	PLUGIN_AUTOUPDATE_ENABLE_REQUEST_SUCCESS,
	PLUGIN_AUTOUPDATE_ENABLE_REQUEST_FAILURE,
	PLUGIN_AUTOUPDATE_DISABLE_REQUEST,
	PLUGIN_AUTOUPDATE_DISABLE_REQUEST_SUCCESS,
	PLUGIN_AUTOUPDATE_DISABLE_REQUEST_FAILURE,
	PLUGIN_INSTALL_REQUEST,
	PLUGIN_INSTALL_REQUEST_SUCCESS,
	PLUGIN_INSTALL_REQUEST_FAILURE,
	PLUGIN_NOTICES_REMOVE,
	RESET_PLUGIN_NOTICES,
	PLUGIN_REMOVE_REQUEST,
	PLUGIN_REMOVE_REQUEST_SUCCESS,
	PLUGIN_REMOVE_REQUEST_FAILURE,
	PLUGIN_INSTALL_REQUEST_PARTIAL_SUCCESS,
} from 'calypso/state/action-types';
import {
	PLUGIN_INSTALLATION_INCOMPLETED,
	PLUGIN_INSTALLATION_COMPLETED,
	PLUGIN_INSTALLATION_ERROR,
	PLUGIN_INSTALLATION_IN_PROGRESS,
	PLUGIN_INSTALLATION_UP_TO_DATE,
} from 'calypso/state/plugins/installed/status/constants';

/*
 * Tracks the current status of plugins on sites, indexed by (site, plugin).
 */
export default function status( state = {}, action ) {
	const { siteId } = action;
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
		case PLUGIN_INSTALL_REQUEST_PARTIAL_SUCCESS:
		case PLUGIN_REMOVE_REQUEST_SUCCESS:
		case PLUGIN_ACTIVATE_REQUEST_FAILURE:
		case PLUGIN_DEACTIVATE_REQUEST_FAILURE:
		case PLUGIN_UPDATE_REQUEST_FAILURE:
		case PLUGIN_AUTOUPDATE_ENABLE_REQUEST_FAILURE:
		case PLUGIN_AUTOUPDATE_DISABLE_REQUEST_FAILURE:
		case PLUGIN_INSTALL_REQUEST_FAILURE:
		case PLUGIN_REMOVE_REQUEST_FAILURE:
		case PLUGIN_ALREADY_UP_TO_DATE:
			return Object.assign( {}, state, { [ siteId ]: statusForSite( state[ siteId ], action ) } );
		case PLUGIN_NOTICES_REMOVE: {
			if ( ! action.statuses || ! action.statuses.length ) {
				return state;
			}

			const allStatuses = Object.entries( state )
				.map( ( [ stateSiteId, siteStatuses ] ) => {
					const updatedSiteStatuses = Object.entries( siteStatuses ).filter(
						( [ , pluginStatus ] ) => {
							return ! action.statuses.includes( pluginStatus.status );
						}
					);

					if ( ! updatedSiteStatuses.length ) {
						return [];
					}

					return [ stateSiteId, Object.fromEntries( updatedSiteStatuses ) ];
				} )
				.filter( ( siteStatus ) => siteStatus.length );

			return Object.fromEntries( allStatuses );
		}
		case RESET_PLUGIN_NOTICES:
			return {};
		default:
			return state;
	}
}

function statusForSite( state = {}, action ) {
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
		case PLUGIN_INSTALL_REQUEST_PARTIAL_SUCCESS:
		case PLUGIN_REMOVE_REQUEST_SUCCESS:
		case PLUGIN_ACTIVATE_REQUEST_FAILURE:
		case PLUGIN_DEACTIVATE_REQUEST_FAILURE:
		case PLUGIN_UPDATE_REQUEST_FAILURE:
		case PLUGIN_AUTOUPDATE_ENABLE_REQUEST_FAILURE:
		case PLUGIN_AUTOUPDATE_DISABLE_REQUEST_FAILURE:
		case PLUGIN_INSTALL_REQUEST_FAILURE:
		case PLUGIN_REMOVE_REQUEST_FAILURE:
		case PLUGIN_ALREADY_UP_TO_DATE:
			if ( typeof state[ pluginId ] !== 'undefined' ) {
				return Object.assign( {}, state, {
					[ pluginId ]: statusForSitePlugin( state[ pluginId ], action ),
				} );
			}
			return Object.assign( {}, state, { [ pluginId ]: statusForSitePlugin( {}, action ) } );
		default:
			return state;
	}
}

function statusForSitePlugin( state = {}, action ) {
	switch ( action.type ) {
		case PLUGIN_ACTIVATE_REQUEST:
		case PLUGIN_DEACTIVATE_REQUEST:
		case PLUGIN_UPDATE_REQUEST:
		case PLUGIN_AUTOUPDATE_ENABLE_REQUEST:
		case PLUGIN_AUTOUPDATE_DISABLE_REQUEST:
		case PLUGIN_INSTALL_REQUEST:
		case PLUGIN_REMOVE_REQUEST:
			return Object.assign( {}, state, {
				status: PLUGIN_INSTALLATION_IN_PROGRESS,
				action: action.action,
			} );
		case PLUGIN_ACTIVATE_REQUEST_SUCCESS:
		case PLUGIN_DEACTIVATE_REQUEST_SUCCESS:
		case PLUGIN_UPDATE_REQUEST_SUCCESS:
		case PLUGIN_AUTOUPDATE_ENABLE_REQUEST_SUCCESS:
		case PLUGIN_AUTOUPDATE_DISABLE_REQUEST_SUCCESS:
		case PLUGIN_INSTALL_REQUEST_SUCCESS:
		case PLUGIN_REMOVE_REQUEST_SUCCESS:
			return Object.assign( {}, state, {
				status: PLUGIN_INSTALLATION_COMPLETED,
				action: action.action,
			} );
		case PLUGIN_ACTIVATE_REQUEST_FAILURE:
		case PLUGIN_DEACTIVATE_REQUEST_FAILURE:
		case PLUGIN_UPDATE_REQUEST_FAILURE:
		case PLUGIN_AUTOUPDATE_ENABLE_REQUEST_FAILURE:
		case PLUGIN_AUTOUPDATE_DISABLE_REQUEST_FAILURE:
		case PLUGIN_INSTALL_REQUEST_FAILURE:
		case PLUGIN_REMOVE_REQUEST_FAILURE:
			return Object.assign( {}, state, {
				status: PLUGIN_INSTALLATION_ERROR,
				action: action.action,
				error: action.error,
			} );
		case PLUGIN_INSTALL_REQUEST_PARTIAL_SUCCESS:
			return Object.assign( {}, state, {
				status: PLUGIN_INSTALLATION_INCOMPLETED,
				action: action.action,
				error: action.error,
			} );
		case PLUGIN_ALREADY_UP_TO_DATE:
			return Object.assign( {}, state, {
				status: PLUGIN_INSTALLATION_UP_TO_DATE,
				action: action.action,
			} );
		default:
			return state;
	}
}
