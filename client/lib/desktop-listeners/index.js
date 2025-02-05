import * as oAuthToken from '@automattic/oauth-token';
import debugFactory from 'debug';
import { navigate } from 'calypso/lib/navigate';
import { newPost } from 'calypso/lib/paths';
import { recordTracksEvent as recordTracksEventAction } from 'calypso/state/analytics/actions';
import { redirectToLogout } from 'calypso/state/current-user/actions';
import { getCurrentUserId, isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { NOTIFY_DESKTOP_NOTIFICATIONS_UNSEEN_COUNT_RESET } from 'calypso/state/desktop/window-events';
import { setForceRefresh as forceNotificationsRefresh } from 'calypso/state/notifications-panel/actions';
import isNotificationsOpen from 'calypso/state/selectors/is-notifications-open';
import { toggleNotificationsPanel } from 'calypso/state/ui/actions';

/**
 * Module variables
 */
const debug = debugFactory( 'calypso:desktop' );

const DesktopListeners = {
	/**
	 * Bootstraps network connection status change handler.
	 * @param {Object} reduxStore The redux store.
	 */
	init: function ( reduxStore ) {
		debug( 'Registering IPC listeners' );
		// Register IPC listeners
		window.electron.receive( 'page-my-sites', this.onShowMySites.bind( this ) );
		window.electron.receive( 'page-reader', this.onShowReader.bind( this ) );
		window.electron.receive( 'page-profile', this.onShowProfile.bind( this ) );
		window.electron.receive( 'new-post', this.onNewPost.bind( this ) );
		window.electron.receive( 'signout', this.onSignout.bind( this ) );
		window.electron.receive( 'toggle-notification-bar', this.onToggleNotifications.bind( this ) );
		window.electron.receive(
			'notifications-panel-show',
			this.onNotificationsPanelShow.bind( this )
		);
		window.electron.receive(
			'notifications-panel-refresh',
			this.onNotificationsPanelRefresh.bind( this )
		);
		window.electron.receive( 'notification-clicked', this.onNotificationClicked.bind( this ) );
		window.electron.receive( 'page-help', this.onShowHelp.bind( this ) );
		window.electron.receive( 'navigate', this.onNavigate.bind( this ) );
		window.electron.receive( 'request-user-login-status', this.sendUserLoginStatus );

		window.addEventListener(
			NOTIFY_DESKTOP_NOTIFICATIONS_UNSEEN_COUNT_RESET,
			this.resetUnseenNotifications.bind( this )
		);

		this.store = reduxStore;

		// Send some events immediately - this sets the app state
		this.sendUserLoginStatus();
	},

	selectedSite: null,

	navigate: function ( to ) {
		this.onNotificationsPanelShow( null, false );
		navigate( to );
	},

	toggleNotificationsPanel: function () {
		this.store.dispatch( toggleNotificationsPanel() );
	},

	setSelectedSite: function ( site ) {
		this.selectedSite = site;
	},

	// window event
	resetUnseenNotifications: function () {
		debug( 'Reseting unseen notification count' );
		window.electron.send( 'clear-notices-count' );
	},

	onNotificationClicked: function ( notification ) {
		debug( `Notification ${ notification.id } clicked` );

		const { id, type } = notification;

		// TODO: Make this a desktop-specific Tracks event.
		this.store.dispatch( recordTracksEventAction( 'calypso_web_push_notification_clicked' ), {
			push_notification_note_id: id,
			push_notification_type: type,
		} );
	},

	onNotificationsPanelRefresh: function () {
		this.store.dispatch( forceNotificationsRefresh( true ) );
	},

	sendUserLoginStatus: function () {
		let status = true;

		if ( ! isUserLoggedIn( this.store.getState() ) ) {
			status = false;
		}

		debug( 'Sending logged-in = ' + status );

		window.electron.send(
			'user-login-status',
			status,
			{ id: getCurrentUserId( this.store.getState() ) },
			oAuthToken.getToken()
		);
	},

	onToggleNotifications: function () {
		debug( 'Toggle notifications' );

		this.toggleNotificationsPanel();
	},

	onNotificationsPanelShow: function ( show ) {
		const isOpen = isNotificationsOpen( this.store.getState() );

		if ( show ) {
			if ( isOpen ) {
				return;
			}
			this.toggleNotificationsPanel();
		} else if ( isOpen ) {
			this.toggleNotificationsPanel();
		}
	},

	onSignout: function () {
		debug( 'Signout' );

		this.store.dispatch( redirectToLogout() );
	},

	onShowMySites: function () {
		debug( 'Showing my sites' );

		this.navigate( '/sites' );
	},

	onShowReader: function () {
		debug( 'Showing reader' );

		this.navigate( '/reader' );
	},

	onShowProfile: function () {
		debug( 'Showing my profile' );

		this.navigate( '/me' );
	},

	onNewPost: function () {
		debug( 'New post' );

		this.navigate( newPost( this.selectedSite ) );
	},

	onShowHelp: function () {
		debug( 'Showing help' );

		this.navigate( '/help' );
	},

	onNavigate: function ( url ) {
		debug( 'Navigating to URL: ', url );

		if ( url ) {
			this.navigate( url );
		}
	},
};

export default DesktopListeners;
