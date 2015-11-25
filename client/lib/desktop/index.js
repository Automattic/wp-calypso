/**
 * External dependencies
 */
var debug = require( 'debug' )( 'calypso:desktop' ),
	page = require( 'page' );

/**
 * Internal dependencies
 */
var siteStatsStickyTabStore = require( 'lib/site-stats-sticky-tab/store' ),
	paths = require( 'lib/paths' ),
	user = require( 'lib/user' )(),
	sites = require( 'lib/sites-list' )(),
	ipc = require( 'electron' ).ipcRenderer,          // From Electron
	store = require( 'store' ),
	oAuthToken = require( 'lib/oauth-token' ),
	userUtilities = require( 'lib/user/utils' ),
	location = require( './page-notifier' );

/**
 * Module variables
 */
var widgetDomain = 'https://widgets.wp.com';

var Desktop = {
	/**
	 * Bootstraps network connection status change handler.
	 */
	init: function() {
		debug( 'Registering IPC listeners' );

		// Register IPC listeners
		ipc.on( 'page-my-sites', this.onShowMySites.bind( this ) );
		ipc.on( 'page-reader', this.onShowReader.bind( this ) );
		ipc.on( 'page-profile', this.onShowProfile.bind( this ) );
		ipc.on( 'new-post', this.onNewPost.bind( this ) );
		ipc.on( 'signout', this.onSignout.bind( this ) );
		ipc.on( 'toggle-notification-bar', this.onToggleNotifications.bind( this ) );
		ipc.on( 'cookie-auth-complete', this.onCookieAuthComplete.bind( this ) );

		window.addEventListener( 'message', this.receiveMessage.bind( this ) );

		// Send some events immediatley - this sets the app state
		this.sendNotificationCount( store.get( 'wpnotes_unseen_count' ) );
		this.sendUserLoginStatus();

		location( function( context ) {
			ipc.send( 'render', context );
		} );
	},

	receiveMessage: function( event ) {
		var data;

		if ( event.origin !== widgetDomain ) {
			return;
		}

		data = JSON.parse( event.data );

		if ( data.type === 'notesIframeMessage' ) {
			if ( data.action === 'render' ) {
				this.sendNotificationCount( data.num_new );
			} else if ( data.action === 'renderAllSeen' ) {
				this.sendNotificationCount( 0 );
			}
		}
	},

	sendUserLoginStatus: function() {
		let status = true;

		if ( user.data === false || user.data instanceof Array ) {
			status = false;
		}

		debug( 'Sending logged-in = ' + status );

		ipc.send( 'user-login-status', status );
		ipc.send( 'user-auth', user, oAuthToken.getToken() );
	},

	sendNotificationCount: function( count ) {
		debug( 'Sending notification count ' + store.get( 'wpnotes_unseen_count' ) );

		ipc.send( 'unread-notices-count', count );
	},

	clearNotificationBar: function() {
		// todo find a better way. seems to be react component state based
		var bar = document.querySelector( '#wpnt-notes-panel2' );

		if ( bar.style.display === 'block' ) {
			this.onToggleNotifications();
		}
	},

	onToggleNotifications: function() {
		// todo find a better way of doing this - masterbar seems to use state to toggle this
		debug( 'Toggle notifications' );

		document.querySelector( '.notifications a' ).click();
	},

	onSignout: function() {
		debug( 'Signout' );

		userUtilities.logout();
	},

	onShowMySites: function() {
		debug( 'Showing my sites' );

		this.clearNotificationBar();
		page( siteStatsStickyTabStore.getUrl() );
	},

	onShowReader: function() {
		debug( 'Showing reader' );

		this.clearNotificationBar();
		page( '/' );
	},

	onShowProfile: function() {
		debug( 'Showing my profile' );

		this.clearNotificationBar();
		page( '/me' );
	},

	onNewPost: function() {
		debug( 'New post' );

		this.clearNotificationBar();
		page( paths.newPost( sites.getSelectedSite() ) );
	},

	// now that our browser session has a valid wordpress.com cookie, let's force
	// reload the notifications iframe so wpcom-proxy-request API calls work
	onCookieAuthComplete: function() {
		var iframe = document.querySelector( '#wpnt-notes-iframe2' );
		iframe.src = iframe.src;
	},

	print: function( title, html ) {
		ipc.send( 'print', title, html );
	}
};

module.exports = Desktop;
