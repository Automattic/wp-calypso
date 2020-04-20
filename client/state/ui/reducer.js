/**
 * Internal dependencies
 */
import {
	SELECTED_SITE_SET,
	SECTION_SET,
	PREVIEW_IS_SHOWING,
	NOTIFICATIONS_PANEL_TOGGLE,
} from 'state/action-types';
import { combineReducers, withoutPersistence } from 'state/utils';
import actionLog from './action-log/reducer';
import billingTransactions from './billing-transactions/reducer';
import checkout from './checkout/reducer';
import comments from './comments/reducer';
import dropZone from './drop-zone/reducer';
import editor from './editor/reducer';
import googleMyBusiness from './google-my-business/reducer';
import guidedTour from './guided-tours/reducer';
import gutenbergOptInDialog from './gutenberg-opt-in-dialog/reducer';
import language from './language/reducer';
import layoutFocus from './layout-focus/reducer';
import masterbarVisibility from './masterbar-visibility/reducer';
import mediaModal from './media-modal/reducer';
import npsSurveyNotice from './nps-survey-notice/reducer';
import oauth2Clients from './oauth2-clients/reducer';
import payment from './payment/reducer';
import postTypeList from './post-type-list/reducer';
import preview from './preview/reducer';
import reader from './reader/reducer';
import route from './route/reducer';
import section from './section/reducer';
import themeSetup from './theme-setup/reducers';

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
	billingTransactions,
	checkout,
	comments,
	dropZone,
	editor,
	googleMyBusiness,
	guidedTour,
	gutenbergOptInDialog,
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
