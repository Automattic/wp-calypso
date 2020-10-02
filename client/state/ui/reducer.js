/**
 * Internal dependencies
 */
import {
	SELECTED_SITE_SET,
	SECTION_LOADING_SET,
	PREVIEW_IS_SHOWING,
	NOTIFICATIONS_PANEL_TOGGLE,
} from 'state/action-types';
import { combineReducers, withoutPersistence } from 'state/utils';
import actionLog from './action-log/reducer';
import checkout from './checkout/reducer';
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

export function isSectionLoading( state = false, action ) {
	switch ( action.type ) {
		case SECTION_LOADING_SET:
			return action.isSectionLoading;
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

const reducer = combineReducers( {
	actionLog,
	checkout,
	gutenbergOptInDialog,
	isSectionLoading,
	isNotificationsOpen,
	isPreviewShowing,
	language,
	layoutFocus,
	masterbarVisibility,
	mediaModal,
	postTypeList,
	preview,
	section,
	selectedSiteId,
	siteSelectionInitialized,
} );

export default reducer;
