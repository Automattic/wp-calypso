/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * WordPress dependencies
 */
import { combineReducers } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { PREFERENCES_DEFAULTS } from './defaults';

/**
 * Reducer returning the user preferences.
 *
 * @param {Object}  state                 Current state.
 * @param {string}  state.mode            Current editor mode, either "visual" or "text".
 * @param {boolean} state.isSidebarOpened Whether the sidebar is opened or closed.
 * @param {Object}  state.panels          The state of the different sidebar panels.
 * @param {Object}  action                Dispatched action.
 *
 * @return {string} Updated state.
 */
export const preferences = combineReducers( {
	activeGeneralSidebar( state = PREFERENCES_DEFAULTS.activeGeneralSidebar, action ) {
		switch ( action.type ) {
			case 'OPEN_GENERAL_SIDEBAR':
				return action.name;

			case 'CLOSE_GENERAL_SIDEBAR':
				return null;
			case 'SERIALIZE': {
				if ( state === 'edit-post/block' ) {
					return PREFERENCES_DEFAULTS.activeGeneralSidebar;
				}
			}
		}

		return state;
	},
	panels( state = PREFERENCES_DEFAULTS.panels, action ) {
		if ( action.type === 'TOGGLE_GENERAL_SIDEBAR_EDITOR_PANEL' ) {
			return {
				...state,
				[ action.panel ]: ! state[ action.panel ],
			};
		}

		return state;
	},
	features( state = PREFERENCES_DEFAULTS.features, action ) {
		if ( action.type === 'TOGGLE_FEATURE' ) {
			return {
				...state,
				[ action.feature ]: ! state[ action.feature ],
			};
		}

		return state;
	},
	editorMode( state = PREFERENCES_DEFAULTS.editorMode, action ) {
		if ( action.type === 'SWITCH_MODE' ) {
			return action.mode;
		}

		return state;
	},
	pinnedPluginItems( state = PREFERENCES_DEFAULTS.pinnedPluginItems, action ) {
		if ( action.type === 'TOGGLE_PINNED_PLUGIN_ITEM' ) {
			return {
				...state,
				[ action.pluginName ]: ! get( state, [ action.pluginName ], true ),
			};
		}
		return state;
	},
} );

export function panel( state = 'document', action ) {
	switch ( action.type ) {
		case 'SET_ACTIVE_PANEL':
			return action.panel;
	}

	return state;
}

export function publishSidebarActive( state = false, action ) {
	switch ( action.type ) {
		case 'OPEN_PUBLISH_SIDEBAR':
			return true;
		case 'CLOSE_PUBLISH_SIDEBAR':
			return false;
		case 'TOGGLE_PUBLISH_SIDEBAR':
			return ! state;
	}
	return state;
}

export default combineReducers( {
	preferences,
	panel,
	publishSidebarActive,
} );
