import { withStorageKey } from '@automattic/state-utils';
import {
	SELECTED_SITE_SET,
	SECTION_LOADING_SET,
	NOTIFICATIONS_PANEL_TOGGLE,
	GLOBALLY_SELECTED_SITE_SET,
} from 'calypso/state/action-types';
import { combineReducers, withSchemaValidation } from 'calypso/state/utils';
import actionLog from './action-log/reducer';
import appBannerDismissed from './app-banner-dismissed/reducer';
import appBannerVisibility from './app-banner-visibility/reducer';
import checkout from './checkout/reducer';
import language from './language/reducer';
import layoutFocus from './layout-focus/reducer';
import masterbarVisibility from './masterbar-visibility/reducer';
import mediaModal from './media-modal/reducer';
import postTypeList from './post-type-list/reducer';
import preview from './preview/reducer';
import section from './section/reducer';

/**
 * Tracks the currently selected site ID.
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @returns {Object}        Updated state
 */
export const selectedSiteId = withSchemaValidation(
	{ type: [ 'number', 'null' ] },
	( state = null, action ) => {
		switch ( action.type ) {
			case SELECTED_SITE_SET:
				return action.siteId || null;
		}

		return state;
	}
);

/**
 * Tracks the currently globally selected site ID.
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @returns {Object}        Updated state
 */
export const globallySelectedSiteId = withSchemaValidation(
	{ type: [ 'number', 'null' ] },
	( state = null, action ) => {
		switch ( action.type ) {
			case GLOBALLY_SELECTED_SITE_SET:
				return action.siteId || null;
		}

		return state;
	}
);

export const siteSelectionInitialized = withSchemaValidation(
	{ type: 'boolean' },
	( state = false, action ) => {
		switch ( action.type ) {
			case SELECTED_SITE_SET:
				return true;
		}

		return state;
	}
);

export function isSectionLoading( state = false, action ) {
	switch ( action.type ) {
		case SECTION_LOADING_SET:
			return action.isSectionLoading;
	}
	return state;
}

/**
 * Tracks if the notifications panel is open
 * @param   {Object} state       Current state
 * @param   {Object} action      Action payload
 * @param   {string} action.type The action type identifier. In this case it's looking for NOTIFICATIONS_PANEL_TOGGLE
 * @returns {Object}             Updated state
 */
export function isNotificationsOpen( state = false, { type } ) {
	if ( type === NOTIFICATIONS_PANEL_TOGGLE ) {
		return ! state;
	}
	return state;
}

const reducer = combineReducers( {
	actionLog,
	appBannerVisibility,
	appBannerDismissed,
	checkout,
	globallySelectedSiteId,
	isSectionLoading,
	isNotificationsOpen,
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

export { reducer };

export default withStorageKey( 'ui', reducer );
