/**
 * Internal dependencies
 */
import {
	SELECTED_SITE_SET,
	SECTION_SET,
	PREVIEW_IS_SHOWING,
	SIDEBAR_TOGGLE_VISIBILITY,
	NOTIFICATIONS_PANEL_TOGGLE,
} from 'state/action-types';
import { combineReducers, withoutPersistence } from 'state/utils';
import actionLog from './action-log/reducer';
import checkout from './checkout/reducer';
import editorDeprecationDialog from './editor-deprecation-dialog/reducer';
import gutenbergOptInDialog from './gutenberg-opt-in-dialog/reducer';
import language from './language/reducer';
import layoutFocus from './layout-focus/reducer';
import masterbarVisibility from './masterbar-visibility/reducer';
import mediaModal from './media-modal/reducer';
import postTypeList from './post-type-list/reducer';
import preview from './preview/reducer';
import section from './section/reducer';

/**
 * Tracks the currently selected site ID.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export function selectedSiteId( state = null, action ) {
	switch ( action.type ) {
		case SELECTED_SITE_SET:
			return action.siteId || null;
	}

	return state;
}

export const siteSelectionInitialized = withoutPersistence( ( state = false, action ) => {
	switch ( action.type ) {
		case SELECTED_SITE_SET:
			return true;
	}

	return state;
} );

export function isLoading( state = false, action ) {
	switch ( action.type ) {
		case SECTION_SET:
			return action.isLoading !== undefined ? action.isLoading : state;
	}
	return state;
}

export const isPreviewShowing = withoutPersistence( ( state = false, action ) => {
	switch ( action.type ) {
		case PREVIEW_IS_SHOWING: {
			const { isShowing } = action;
			return isShowing !== undefined ? isShowing : state;
		}
	}

	return state;
} );

/**
 * Tracks if the notifications panel is open
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export const isNotificationsOpen = function ( state = false, { type } ) {
	if ( type === NOTIFICATIONS_PANEL_TOGGLE ) {
		return ! state;
	}
	return state;
};

/**
 * Tracks if the sidebar is collapsed
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */

export const sidebarVisibility = ( state = false, { type, sidebarIsCollapsed } ) => {
	switch ( type ) {
		case SIDEBAR_TOGGLE_VISIBILITY:
			return sidebarIsCollapsed;
	}
	return state;
};

const reducer = combineReducers( {
	actionLog,
	checkout,
	editorDeprecationDialog,
	gutenbergOptInDialog,
	isLoading,
	isNotificationsOpen,
	isPreviewShowing,
	language,
	layoutFocus,
	masterbarVisibility,
	sidebarVisibility,
	mediaModal,
	postTypeList,
	preview,
	section,
	selectedSiteId,
	siteSelectionInitialized,
} );

export default reducer;
