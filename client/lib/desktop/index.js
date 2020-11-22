/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { newPost } from 'calypso/lib/paths';
import store from 'store';
import user from 'calypso/lib/user';
import { ipcRenderer as ipc } from 'electron';
import userUtilities from 'calypso/lib/user/utils';
import * as oAuthToken from 'calypso/lib/oauth-token';
import { getStatsPathForTab } from 'calypso/lib/route';
import { getReduxStore } from 'calypso/lib/redux-bridge';
import isNotificationsOpen from 'calypso/state/selectors/is-notifications-open';
import { toggleNotificationsPanel, navigate } from 'calypso/state/ui/actions';
import { recordTracksEvent as recordTracksEventAction } from 'calypso/state/analytics/actions';
import {
	NOTIFY_DESKTOP_CANNOT_USE_EDITOR,
	NOTIFY_DESKTOP_DID_REQUEST_SITE,
	NOTIFY_DESKTOP_DID_ACTIVATE_JETPACK_MODULE,
	NOTIFY_DESKTOP_SEND_TO_PRINTER,
	NOTIFY_DESKTOP_NOTIFICATIONS_UNSEEN_COUNT_SET,
	NOTIFY_DESKTOP_VIEW_POST_CLICKED,
} from 'calypso/state/desktop/window-events';
import { canCurrentUserManageSiteOptions } from 'calypso/state/sites/selectors';
import { activateModule } from 'calypso/state/jetpack/modules/actions';
import { requestSite } from 'calypso/state/sites/actions';
import { setForceRefresh as forceNotificationsRefresh } from 'calypso/state/notifications-panel/actions';

/**
 * Module variables
 */
const debug = debugFactory( 'calypso:desktop' );

const Desktop = {
	/**
	 * Bootstraps network connection status change handler.
	 */
	init: async function () {
		debug( 'Registering IPC listeners' );

		// Register IPC listeners
		ipc.on( 'page-my-sites', this.onShowMySites.bind( this ) );
		ipc.on( 'page-reader', this.onShowReader.bind( this ) );
		ipc.on( 'page-profile', this.onShowProfile.bind( this ) );
		ipc.on( 'new-post', this.onNewPost.bind( this ) );
		ipc.on( 'signout', this.onSignout.bind( this ) );
		ipc.on( 'toggle-notification-bar', this.onToggleNotifications.bind( this ) );
		ipc.on( 'notifications-panel-show', this.onNotificationsPanelShow.bind( this ) );
		ipc.on( 'notifications-panel-refresh', this.onNotificationsPanelRefresh.bind( this ) );
		ipc.on( 'notification-clicked', this.onNotificationClicked.bind( this ) );
		ipc.on( 'page-help', this.onShowHelp.bind( this ) );
		ipc.on( 'navigate', this.onNavigate.bind( this ) );
		ipc.on( 'request-site', this.onRequestSite.bind( this ) );
		ipc.on( 'enable-site-option', this.onActivateJetpackSiteModule.bind( this ) );
		ipc.on( 'enable-notification-badge', this.sendNotificationUnseenCount );
		ipc.on( 'request-user-login-status', this.sendUserLoginStatus );

		window.addEventListener(
			NOTIFY_DESKTOP_CANNOT_USE_EDITOR,
			this.onCannotOpenEditor.bind( this )
		);

		window.addEventListener(
			NOTIFY_DESKTOP_VIEW_POST_CLICKED,
			this.onViewPostClicked.bind( this )
		);

		window.addEventListener(
			NOTIFY_DESKTOP_NOTIFICATIONS_UNSEEN_COUNT_SET,
			this.onUnseenCountUpdated.bind( this )
		);

		window.addEventListener( NOTIFY_DESKTOP_SEND_TO_PRINTER, this.onSendToPrinter.bind( this ) );

		this.store = await getReduxStore();

		// Send some events immediately - this sets the app state
		this.sendNotificationUnseenCount();
		this.sendUserLoginStatus();
	},

	selectedSite: null,

	navigate: function ( to ) {
		this.onNotificationsPanelShow( null, false );
		this.store.dispatch( navigate( to ) );
	},

	toggleNotificationsPanel: function () {
		this.store.dispatch( toggleNotificationsPanel() );
	},

	setSelectedSite: function ( site ) {
		this.selectedSite = site;
	},

	sendNotificationUnseenCount: function () {
		// Used to update unseen badge count when booting the app: no-op if not connected.
		const navigator = window.navigator;
		const connected = typeof navigator !== 'undefined' ? !! navigator.onLine : true;
		if ( ! connected ) {
			return;
		}
		const unseenCount = store.get( 'wpnotes_unseen_count' );
		if ( unseenCount !== null ) {
			debug( `Sending unseen count: ${ unseenCount }` );
			ipc.send( 'unread-notices-count', unseenCount );
		}
	},

	onUnseenCountUpdated: function ( event ) {
		const { unseenCount } = event.detail;
		debug( `Sending unseen count: ${ unseenCount }` );
		ipc.send( 'unread-notices-count', unseenCount );
	},

	onNotificationClicked: function ( _, notification ) {
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

		if ( user().get() === false ) {
			status = false;
		}

		debug( 'Sending logged-in = ' + status );

		ipc.send( 'user-login-status', status, user(), oAuthToken.getToken() );
	},

	onToggleNotifications: function () {
		debug( 'Toggle notifications' );

		this.toggleNotificationsPanel();
	},

	onNotificationsPanelShow: function ( _, show ) {
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

		userUtilities.logout();
	},

	onShowMySites: function () {
		debug( 'Showing my sites' );
		const site = this.selectedSite;
		const siteSlug = site ? site.slug : null;

		this.navigate( getStatsPathForTab( 'day', siteSlug ) );
	},

	onShowReader: function () {
		debug( 'Showing reader' );

		this.navigate( '/read' );
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

	onCannotOpenEditor: function ( event ) {
		const { site, reason, editorUrl, wpAdminLoginUrl } = event.detail;
		debug( 'Received window event: unable to load editor for site: ', site.URL );

		const siteId = site.ID;
		const state = this.store.getState();
		const canUserManageOptions = canCurrentUserManageSiteOptions( state, siteId );
		const payload = {
			siteId,
			reason,
			editorUrl,
			wpAdminLoginUrl,
			origin: site.URL,
			canUserManageOptions,
		};

		ipc.send( 'cannot-use-editor', payload );
	},

	onViewPostClicked: function ( event ) {
		const { url } = event.detail;
		debug( `Received window event: "View Post" clicked for URL: ${ url }` );

		ipc.send( 'view-post-clicked', url );
	},

	onActivateJetpackSiteModule: function ( event, info ) {
		const { siteId, option } = info;
		debug( `User enabling option '${ option }' for siteId ${ siteId }` );

		const response = NOTIFY_DESKTOP_DID_ACTIVATE_JETPACK_MODULE;
		function onDidActivateJetpackSiteModule( responseEvent ) {
			debug( 'Received Jetpack module activation response for: ', responseEvent.detail );

			window.removeEventListener( response, this );
			const { status, siteId: responseSiteId } = responseEvent.detail;
			let { error } = responseEvent.detail;
			if ( Number( siteId ) !== Number( responseSiteId ) ) {
				error = `Expected response for siteId: ${ siteId }, got: ${ responseSiteId }`;
			}
			ipc.send( 'enable-site-option-response', { status, siteId, error } );
		}
		window.addEventListener(
			response,
			onDidActivateJetpackSiteModule.bind( onDidActivateJetpackSiteModule )
		);

		this.store.dispatch( activateModule( siteId, option ) );
	},

	onRequestSite: function ( event, siteId ) {
		debug( 'Refreshing redux state for siteId: ', siteId );

		const response = NOTIFY_DESKTOP_DID_REQUEST_SITE;
		function onDidRequestSite( responseEvent ) {
			debug( 'Received site request response for: ', responseEvent.detail );

			window.removeEventListener( response, this );
			const { status, siteId: responseSiteId } = responseEvent.detail;
			let { error } = responseEvent.detail;
			if ( Number( siteId ) !== Number( responseSiteId ) ) {
				error = `Expected response for siteId: ${ siteId }, got: ${ responseSiteId }`;
			}
			ipc.send( 'request-site-response', { siteId, status, error } );
		}
		window.addEventListener( response, onDidRequestSite.bind( onDidRequestSite ) );

		this.store.dispatch( requestSite( siteId ) );
	},

	onNavigate: function ( event, url ) {
		debug( 'Navigating to URL: ', url );

		if ( url ) {
			this.navigate( url );
		}
	},

	onSendToPrinter: function ( event ) {
		const { title, contents } = event.detail;
		this.print( title, contents );
	},

	print: function ( title, html ) {
		ipc.send( 'print', title, html );
	},
};

export default Desktop;
