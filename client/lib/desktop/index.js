/**
 * External dependencies
 */
import debugFactory from 'debug';

const debug = debugFactory( 'calypso:desktop' );

/**
 * Internal dependencies
 */
import { newPost } from 'lib/paths';
import userFactory from 'lib/user';
const user = userFactory();
import { ipcRenderer as ipc } from 'electron'; // From Electron
import * as oAuthToken from 'lib/oauth-token';
import userUtilities from 'lib/user/utils';
import { getStatsPathForTab } from 'lib/route';
import { getReduxStore } from 'lib/redux-bridge';
import hasUnseenNotifications from 'state/selectors/has-unseen-notifications';
import { isEditorIframeLoaded } from 'state/ui/editor/selectors';
import isNotificationsOpen from 'state/selectors/is-notifications-open';
import { toggleNotificationsPanel, navigate } from 'state/ui/actions';

/**
 * Module variables
 */

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
		ipc.on( 'page-help', this.onShowHelp.bind( this ) );

		this.store = await getReduxStore();

		this.editorLoadedStatus();

		// Send some events immediatley - this sets the app state
		this.notificationStatus();
		this.sendUserLoginStatus();
	},

	selectedSite: null,

	navigate: function ( to ) {
		if ( isNotificationsOpen( this.store.getState() ) ) {
			this.toggleNotificationsPanel();
		}

		this.store.dispatch( navigate( to ) );
	},

	toggleNotificationsPanel: function () {
		this.store.dispatch( toggleNotificationsPanel() );
	},

	setSelectedSite: function ( site ) {
		this.selectedSite = site;
	},

	notificationStatus: function () {
		let previousHasUnseen = hasUnseenNotifications( this.store.getState() );

		// Send initial status to main process
		ipc.send( 'unread-notices-count', previousHasUnseen );

		this.store.subscribe( () => {
			const hasUnseen = hasUnseenNotifications( this.store.getState() );

			if ( hasUnseen !== previousHasUnseen ) {
				ipc.send( 'unread-notices-count', hasUnseen );

				previousHasUnseen = hasUnseen;
			}
		} );
	},

	sendUserLoginStatus: function () {
		let status = true;

		if ( user.data === false || user.data instanceof Array ) {
			status = false;
		}

		debug( 'Sending logged-in = ' + status );

		ipc.send( 'user-login-status', status );
		ipc.send( 'user-auth', user, oAuthToken.getToken() );
	},

	onToggleNotifications: function () {
		debug( 'Toggle notifications' );

		this.toggleNotificationsPanel();
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

	editorLoadedStatus: function () {
		const sendLoadedEvt = () => {
			debug( 'Editor iframe loaded' );

			const evt = new window.Event( 'editor-iframe-loaded' );
			window.dispatchEvent( evt );
		};

		let previousLoaded = isEditorIframeLoaded( this.store.getState() );

		if ( previousLoaded ) {
			sendLoadedEvt();
		}

		this.store.subscribe( () => {
			const state = this.store.getState();
			const loaded = isEditorIframeLoaded( state );

			if ( loaded !== previousLoaded ) {
				if ( loaded ) {
					sendLoadedEvt();
				}

				previousLoaded = loaded;
			}
		} );
	},

	print: function ( title, html ) {
		ipc.send( 'print', title, html );
	},
};

export default Desktop;
