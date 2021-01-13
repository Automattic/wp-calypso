/**
 * Internal dependencies
 */
const log = require( 'calypso/desktop/lib/logger' )( 'desktop:ipc' );

module.exports = {
	showMySites: function ( mainWindow ) {
		log.info( 'showMySites triggered' );
		mainWindow.webContents.send( 'page-my-sites' );
	},

	showReader: function ( mainWindow ) {
		log.info( 'showReader triggered' );
		mainWindow.webContents.send( 'page-reader' );
	},

	showProfile: function ( mainWindow ) {
		log.info( 'showProfile triggered' );
		mainWindow.webContents.send( 'page-profile' );
	},

	newPost: function ( mainWindow ) {
		log.info( 'newPost triggered' );
		mainWindow.webContents.send( 'new-post' );
	},

	toggleNotifications: function ( mainWindow ) {
		log.info( 'toggleNotifications triggered' );
		mainWindow.webContents.send( 'toggle-notification-bar' );
	},

	showHelp: function ( mainWindow ) {
		log.info( 'showHelp triggered' );
		mainWindow.webContents.send( 'page-help' );
	},

	signOut: function ( mainWindow ) {
		log.info( 'signOut triggered' );
		mainWindow.webContents.send( 'signout' );
	},
};
