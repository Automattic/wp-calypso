/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import config from 'config';
import {
	ANALYTICS_SUPER_PROPS_UPDATE,
	NOTIFICATIONS_PANEL_TOGGLE,
	SELECTED_SITE_SET,
	SITE_RECEIVE,
	SITES_RECEIVE,
	SITES_UPDATE,
} from 'state/action-types';
import analytics from 'lib/analytics';
import cartStore from 'lib/cart/store';
import { isNotificationsOpen } from 'state/selectors';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import { getCurrentUser } from 'state/current-user/selectors';
import keyboardShortcuts from 'lib/keyboard-shortcuts';

/**
 * Module variables
 */
const globalKeyBoardShortcutsEnabled = config.isEnabled( 'keyboard-shortcuts' );
let globalKeyboardShortcuts;

if ( globalKeyBoardShortcutsEnabled ) {
	globalKeyboardShortcuts = require( 'lib/keyboard-shortcuts/global' )();
}

const desktopEnabled = config.isEnabled( 'desktop' );
let desktop;
if ( desktopEnabled ) {
	desktop = require( 'lib/desktop' );
}

/**
 * Sets the selectedSite and siteCount for lib/analytics. This is used to
 * populate extra fields on tracks analytics calls.
 *
 * @param {function} dispatch - redux dispatch function
 * @param {object}   action   - the dispatched action
 * @param {function} getState - redux getState function
 */
const updateSelectedSiteForAnalytics = ( dispatch, action, getState ) => {
	const state = getState();
	const selectedSite = getSelectedSite( state );
	const user = getCurrentUser( state );
	const siteCount = get( user, 'site_count', 0 );
	analytics.setSelectedSite( selectedSite );
	analytics.setSiteCount( siteCount );
};

/**
 * Sets the selectedSiteId for lib/cart/store
 *
 * @param {function} dispatch - redux dispatch function
 * @param {object}   action   - the dispatched action
 * @param {function} getState - redux getState function
 */
const updateSelectedSiteForCart = ( dispatch, action, getState ) => {
	const state = getState();
	const selectedSiteId = getSelectedSiteId( state );
	cartStore.setSelectedSiteId( selectedSiteId );
};

/**
 * Sets the selectedSite for lib/keyboard-shortcuts/global
 *
 * @param {function} dispatch - redux dispatch function
 * @param {object}   action   - the dispatched action
 * @param {function} getState - redux getState function
 */
const updatedSelectedSiteForKeyboardShortcuts = ( dispatch, action, getState ) => {
	const state = getState();
	const selectedSite = getSelectedSite( state );
	globalKeyboardShortcuts.setSelectedSite( selectedSite );
};

/**
 * Sets isNotificationOpen for lib/keyboard-shortcuts
 *
 * @param {function} dispatch - redux dispatch function
 * @param {object}   action   - the dispatched action
 * @param {function} getState - redux getState function
 */
const updateNotificationsOpenForKeyboardShortcuts = ( dispatch, action, getState ) => {
	// flip the state here, since the reducer hasn't had a chance to update yet
	const toggledState = ! isNotificationsOpen( getState() );
	keyboardShortcuts.setNotificationsOpen( toggledState );
};

/**
 * Sets the selected site for lib/desktop
 *
 * @param {function} dispatch - redux dispatch function
 * @param {object}   action   - the dispatched action
 * @param {function} getState - redux getState function
 */
const updateSelectedSiteForDesktop = ( dispatch, action, getState ) => {
	const state = getState();
	const selectedSite = getSelectedSite( state );
	desktop.setSelectedSite( selectedSite );
};

const handler = ( dispatch, action, getState ) => {
	switch ( action.type ) {
		case ANALYTICS_SUPER_PROPS_UPDATE:
			return updateSelectedSiteForAnalytics( dispatch, action, getState );

		//when the notifications panel is open keyboard events should not fire.
		case NOTIFICATIONS_PANEL_TOGGLE:
			return updateNotificationsOpenForKeyboardShortcuts( dispatch, action, getState );

		case SELECTED_SITE_SET:
		case SITE_RECEIVE:
		case SITES_RECEIVE:
		case SITES_UPDATE:
			// Wait a tick for the reducer to update the state tree
			setTimeout( () => {
				updateSelectedSiteForCart( dispatch, action, getState );
				if ( globalKeyBoardShortcutsEnabled ) {
					updatedSelectedSiteForKeyboardShortcuts( dispatch, action, getState );
				}
				if ( desktopEnabled ) {
					updateSelectedSiteForDesktop( dispatch, action, getState );
				}
			}, 0 );
			return;
	}
};

export const libraryMiddleware = ( { dispatch, getState } ) => ( next ) => ( action ) => {
	handler( dispatch, action, getState );

	return next( action );
};

export default libraryMiddleware;
