'use strict';

/**
 * External Dependencies
 */
const debug = require( 'debug' )( 'desktop:ipc' );

module.exports = {
	showMySites: function( mainWindow ) {
		debug( 'showMySites triggered' );
		mainWindow.webContents.send( 'page-my-sites' );
	},

	showReader: function( mainWindow ) {
		debug( 'showReader triggered' );
		mainWindow.webContents.send( 'page-reader' );
	},

	showProfile: function( mainWindow ) {
		debug( 'showProfile triggered' );
		mainWindow.webContents.send( 'page-profile' );
	},

	newPost: function( mainWindow ) {
		debug( 'newPost triggered' );
		mainWindow.webContents.send( 'new-post' );
	},

	toggleNotifications: function( mainWindow ) {
		debug( 'toggleNotifications triggered' );
		mainWindow.webContents.send( 'toggle-notification-bar' );
	},

	showHelp: function( mainWindow ) {
		debug( 'showHelp triggered' );
		mainWindow.webContents.send( 'page-help' );
	},

	signOut: function( mainWindow ) {
		debug( 'signOut triggered' );
		mainWindow.webContents.send( 'signout' );
	}
};
