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
 * The default active general sidebar: The "Document" tab.
 *
 * @type {string}
 */
export const DEFAULT_ACTIVE_GENERAL_SIDEBAR = 'edit-post/document';

/**
 * Reducer returning the user preferences.
 *
 * @param {Object}  state                           Current state.
 * @param {string}  state.mode                      Current editor mode, either
 *                                                  "visual" or "text".
 * @param {boolean} state.isGeneralSidebarDismissed Whether general sidebar is
 *                                                  dismissed. False by default
 *                                                  or when closing general
 *                                                  sidebar, true when opening
 *                                                  sidebar.
 * @param {boolean} state.isSidebarOpened           Whether the sidebar is
 *                                                  opened or closed.
 * @param {Object}  state.panels                    The state of the different
 *                                                  sidebar panels.
 * @param {Object}  action                          Dispatched action.
 *
 * @return {Object} Updated state.
 */
export const preferences = combineReducers( {
	isGeneralSidebarDismissed( state = false, action ) {
		switch ( action.type ) {
			case 'OPEN_GENERAL_SIDEBAR':
			case 'CLOSE_GENERAL_SIDEBAR':
				return action.type === 'CLOSE_GENERAL_SIDEBAR';
		}

		return state;
	},
	panels( state = PREFERENCES_DEFAULTS.panels, action ) {
		switch ( action.type ) {
			case 'TOGGLE_PANEL_ENABLED': {
				const { panelName } = action;
				return {
					...state,
					[ panelName ]: {
						...state[ panelName ],
						enabled: ! get( state, [ panelName, 'enabled' ], true ),
					},
				};
			}

			case 'TOGGLE_PANEL_OPENED': {
				const { panelName } = action;
				const isOpen = state[ panelName ] === true || get( state, [ panelName, 'opened' ], false );
				return {
					...state,
					[ panelName ]: {
						...state[ panelName ],
						opened: ! isOpen,
					},
				};
			}
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

/**
 * Reducer returning the next active general sidebar state. The active general
 * sidebar is a unique name to identify either an editor or plugin sidebar.
 *
 * @param {?string} state  Current state.
 * @param {Object}  action Action object.
 *
 * @return {?string} Updated state.
 */
export function activeGeneralSidebar( state = DEFAULT_ACTIVE_GENERAL_SIDEBAR, action ) {
	switch ( action.type ) {
		case 'OPEN_GENERAL_SIDEBAR':
			return action.name;
	}

	return state;
}

export function panel( state = 'document', action ) {
	switch ( action.type ) {
		case 'SET_ACTIVE_PANEL':
			return action.panel;
	}

	return state;
}

/**
 * Reducer for storing the name of the open modal, or null if no modal is open.
 *
 * @param {Object} state  Previous state.
 * @param {Object} action Action object containing the `name` of the modal
 *
 * @return {Object} Updated state
 */
export function activeModal( state = null, action ) {
	switch ( action.type ) {
		case 'OPEN_MODAL':
			return action.name;
		case 'CLOSE_MODAL':
			return null;
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

/**
 * Reducer keeping track of the meta boxes isSaving state.
 * A "true" value means the meta boxes saving request is in-flight.
 *
 *
 * @param {boolean}  state   Previous state.
 * @param {Object}   action  Action Object.
 *
 * @return {Object} Updated state.
 */
export function isSavingMetaBoxes( state = false, action ) {
	switch ( action.type ) {
		case 'REQUEST_META_BOX_UPDATES':
			return true;
		case 'META_BOX_UPDATES_SUCCESS':
			return false;
		default:
			return state;
	}
}

/**
 * Reducer keeping track of the meta boxes per location.
 *
 * @param {boolean}  state   Previous state.
 * @param {Object}   action  Action Object.
 *
 * @return {Object} Updated state.
 */
export function metaBoxLocations( state = {}, action ) {
	switch ( action.type ) {
		case 'SET_META_BOXES_PER_LOCATIONS':
			return action.metaBoxesPerLocation;
	}

	return state;
}

const metaBoxes = combineReducers( {
	isSaving: isSavingMetaBoxes,
	locations: metaBoxLocations,
} );

export default combineReducers( {
	preferences,
	activeGeneralSidebar,
	panel,
	activeModal,
	publishSidebarActive,
	metaBoxes,
} );
