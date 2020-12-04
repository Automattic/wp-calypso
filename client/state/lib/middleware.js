/**
 * External dependencies
 */
import { once, defer } from 'lodash';
import notices from 'calypso/notices';
import page from 'page';

/**
 * Internal dependencies
 */
import config from 'calypso/config';
import {
	JETPACK_DISCONNECT_RECEIVE,
	NOTIFICATIONS_PANEL_TOGGLE,
	ROUTE_SET,
	SELECTED_SITE_SET,
	SITE_DELETE_RECEIVE,
	SITE_RECEIVE,
	SITES_RECEIVE,
} from 'calypso/state/action-types';
import user from 'calypso/lib/user';
import hasSitePendingAutomatedTransfer from 'calypso/state/selectors/has-site-pending-automated-transfer';
import { isFetchingAutomatedTransferStatus } from 'calypso/state/automated-transfer/selectors';
import isNotificationsOpen from 'calypso/state/selectors/is-notifications-open';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getCurrentUserEmail } from 'calypso/state/current-user/selectors';
import keyboardShortcuts from 'calypso/lib/keyboard-shortcuts';
import getGlobalKeyboardShortcuts from 'calypso/lib/keyboard-shortcuts/global';
import { fetchAutomatedTransferStatus } from 'calypso/state/automated-transfer/actions';
import {
	createImmediateLoginMessage,
	createPathWithoutImmediateLoginInformation,
} from 'calypso/state/immediate-login/utils';
import { saveImmediateLoginInformation } from 'calypso/state/immediate-login/actions';

/**
 * Module variables
 */
const globalKeyBoardShortcutsEnabled = config.isEnabled( 'keyboard-shortcuts' );
let globalKeyboardShortcuts;

if ( globalKeyBoardShortcutsEnabled ) {
	globalKeyboardShortcuts = getGlobalKeyboardShortcuts();
}

const desktop = config.isEnabled( 'desktop' ) ? require( 'calypso/lib/desktop' ).default : null;

/**
 * Notifies user about the fact that they were automatically logged in
 * via an immediate link.
 *
 * @param {Function} dispatch - redux dispatch function
 * @param {object}   action   - the dispatched action
 * @param {Function} getState - redux getState function
 */
const notifyAboutImmediateLoginLinkEffects = once( ( dispatch, action, getState ) => {
	if ( ! action.query.immediate_login_attempt ) {
		return;
	}

	// Store immediate login information for future reference.
	dispatch(
		saveImmediateLoginInformation(
			action.query.immediate_login_success,
			action.query.login_reason,
			action.query.login_email,
			action.query.login_locale
		)
	);

	// Redirect to a page without immediate login information in the URL
	page.replace( createPathWithoutImmediateLoginInformation( action.path, action.query ) );

	// Only show the message if the user is currently logged in and if the URL
	// suggests that they were just logged in via an immediate login request.
	if ( ! action.query.immediate_login_success ) {
		return;
	}
	const email = getCurrentUserEmail( getState() );
	if ( ! email ) {
		return;
	}

	// Let redux process all dispatches that are currently queued and show the message
	defer( () => {
		notices.success( createImmediateLoginMessage( action.query.login_reason, email ) );
	} );
} );

/**
 * Sets the selectedSite for lib/keyboard-shortcuts/global
 *
 * @param {Function} dispatch - redux dispatch function
 * @param {object}   action   - the dispatched action
 * @param {Function} getState - redux getState function
 */
const updatedSelectedSiteForKeyboardShortcuts = ( dispatch, action, getState ) => {
	const state = getState();
	const selectedSite = getSelectedSite( state );
	globalKeyboardShortcuts.setSelectedSite( selectedSite );
};

/**
 * Sets isNotificationOpen for lib/keyboard-shortcuts
 *
 * @param {Function} dispatch - redux dispatch function
 * @param {object}   action   - the dispatched action
 * @param {Function} getState - redux getState function
 */
const updateNotificationsOpenForKeyboardShortcuts = ( dispatch, action, getState ) => {
	// flip the state here, since the reducer hasn't had a chance to update yet
	const toggledState = ! isNotificationsOpen( getState() );
	keyboardShortcuts.setNotificationsOpen( toggledState );
};

/**
 * Sets the selected site for lib/desktop
 *
 * @param {Function} dispatch - redux dispatch function
 * @param {object}   action   - the dispatched action
 * @param {Function} getState - redux getState function
 */
const updateSelectedSiteForDesktop = ( dispatch, action, getState ) => {
	const state = getState();
	const selectedSite = getSelectedSite( state );
	desktop.setSelectedSite( selectedSite );
};

const fetchAutomatedTransferStatusForSelectedSite = ( dispatch, getState ) => {
	const state = getState();
	const siteId = getSelectedSiteId( state );
	const isFetchingATStatus = isFetchingAutomatedTransferStatus( state, siteId );

	if ( ! isFetchingATStatus && hasSitePendingAutomatedTransfer( state, siteId ) ) {
		dispatch( fetchAutomatedTransferStatus( siteId ) );
	}
};

const handler = ( dispatch, action, getState ) => {
	switch ( action.type ) {
		case ROUTE_SET:
			return notifyAboutImmediateLoginLinkEffects( dispatch, action, getState );

		//when the notifications panel is open keyboard events should not fire.
		case NOTIFICATIONS_PANEL_TOGGLE:
			return updateNotificationsOpenForKeyboardShortcuts( dispatch, action, getState );

		case SELECTED_SITE_SET:
		case SITE_RECEIVE:
		case SITES_RECEIVE:
			// Wait a tick for the reducer to update the state tree
			setTimeout( () => {
				if ( globalKeyBoardShortcutsEnabled ) {
					updatedSelectedSiteForKeyboardShortcuts( dispatch, action, getState );
				}
				if ( config.isEnabled( 'desktop' ) ) {
					updateSelectedSiteForDesktop( dispatch, action, getState );
				}

				fetchAutomatedTransferStatusForSelectedSite( dispatch, getState );
			}, 0 );
			return;

		case SITE_DELETE_RECEIVE:
		case JETPACK_DISCONNECT_RECEIVE:
			user().decrementSiteCount();
			return;
	}
};

export const libraryMiddleware = ( { dispatch, getState } ) => ( next ) => ( action ) => {
	handler( dispatch, action, getState );

	return next( action );
};

export default libraryMiddleware;
