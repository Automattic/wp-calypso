import { once, defer } from 'lodash';
import page from 'page';
import keyboardShortcuts from 'calypso/lib/keyboard-shortcuts';
import {
	NOTIFICATIONS_PANEL_TOGGLE,
	ROUTE_SET,
	SELECTED_SITE_SET,
	SITE_RECEIVE,
	SITES_RECEIVE,
} from 'calypso/state/action-types';
import { getCurrentUserEmail } from 'calypso/state/current-user/selectors';
import { saveImmediateLoginInformation } from 'calypso/state/immediate-login/actions';
import {
	createImmediateLoginMessage,
	createPathWithoutImmediateLoginInformation,
} from 'calypso/state/immediate-login/utils';
import { successNotice } from 'calypso/state/notices/actions';
import isNotificationsOpen from 'calypso/state/selectors/is-notifications-open';

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
		dispatch( successNotice( createImmediateLoginMessage( action.query.login_reason, email ) ) );
	} );
} );

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
			setTimeout( async () => {
				const { fetchAutomatedTransferStatusForSelectedSite } = await import(
					/* webpackChunkName: "automated-transfer-state-middleware" */
					'calypso/state/lib/automated-transfer-middleware'
				);
				fetchAutomatedTransferStatusForSelectedSite( dispatch, getState );
			}, 0 );
			return;
	}
};

export const libraryMiddleware = ( { dispatch, getState } ) => ( next ) => ( action ) => {
	handler( dispatch, action, getState );

	return next( action );
};

export default libraryMiddleware;
