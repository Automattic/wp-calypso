/** @format */

/**
 * Internal dependencies
 */

import {
	MASTERBAR_TOGGLE_VISIBILITY,
	SELECTED_SITE_SET,
	SECTION_SET,
	PREVIEW_IS_SHOWING,
	NOTIFICATIONS_PANEL_TOGGLE,
} from 'state/action-types';
import { combineReducers, createReducer } from 'state/utils';
import actionLog from './action-log/reducer';
import comments from './comments/reducer';
import dropZone from './drop-zone/reducer';
import editor from './editor/reducer';
import guidedTour from './guided-tours/reducer';
import language from './language/reducer';
import layoutFocus from './layout-focus/reducer';
import mediaModal from './media-modal/reducer';
import npsSurveyNotice from './nps-survey-notice/reducer';
import oauth2Clients from './oauth2-clients/reducer';
import payment from './payment/reducer';
import postTypeList from './post-type-list/reducer';
import preview from './preview/reducer';
import reader from './reader/reducer';
import route from './route/reducer';
import themeSetup from './theme-setup/reducers';

/**
 * Tracks the currently selected site ID.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function selectedSiteId( state = null, action ) {
	switch ( action.type ) {
		case SELECTED_SITE_SET:
			return action.siteId || null;
	}

	return state;
}

export const siteSelectionInitialized = createReducer( false, {
	[ SELECTED_SITE_SET ]: () => true,
} );

//TODO: do we really want to mix strings and booleans?
export function section( state = false, action ) {
	switch ( action.type ) {
		case SECTION_SET:
			return action.section !== undefined ? action.section : state;
	}
	return state;
}

export function hasSidebar( state = true, action ) {
	switch ( action.type ) {
		case SECTION_SET:
			return action.hasSidebar !== undefined ? action.hasSidebar : state;
	}
	return state;
}

export function isLoading( state = false, action ) {
	switch ( action.type ) {
		case SECTION_SET:
			return action.isLoading !== undefined ? action.isLoading : state;
	}
	return state;
}

export const isPreviewShowing = createReducer( false, {
	[ PREVIEW_IS_SHOWING ]: ( state, { isShowing } ) =>
		isShowing !== undefined ? isShowing : state,
} );

/**
 * Tracks if the notifications panel is open
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const isNotificationsOpen = function( state = false, { type } ) {
	if ( type === NOTIFICATIONS_PANEL_TOGGLE ) {
		return ! state;
	}
	return state;
};

export const masterbarVisibility = ( state = true, { type, isVisible } ) =>
	type === MASTERBAR_TOGGLE_VISIBILITY ? isVisible : state;

const reducer = combineReducers( {
	actionLog,
	comments,
	dropZone,
	editor,
	guidedTour,
	hasSidebar,
	isLoading,
	isNotificationsOpen,
	isPreviewShowing,
	language,
	layoutFocus,
	masterbarVisibility,
	mediaModal,
	npsSurveyNotice,
	oauth2Clients,
	payment,
	postTypeList,
	preview,
	reader,
	route,
	section,
	selectedSiteId,
	siteSelectionInitialized,
	themeSetup,
} );

export default reducer;
