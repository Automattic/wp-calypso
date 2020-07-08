/**
 * External Dependencies
 */
const { Menu } = require( 'electron' ); // eslint-disable-line import/no-extraneous-dependencies

/**
 * Internal dependencies
 */
const template = require( './main-menu' );
const menuSetter = require( 'desktop/lib/menu-setter' );
const log = require( 'desktop/lib/logger' )( 'desktop:menu' );

/**
 * Module variables
 */
let appMenu = false;

function AppMenu() {
	this.menu = false;
}

AppMenu.prototype.set = function ( app, mainWindow ) {
	this.menu = Menu.buildFromTemplate( template( app, mainWindow ) );

	Menu.setApplicationMenu( this.menu );
};

AppMenu.prototype.enableLoggedInItems = function () {
	log.info( 'Enabling logged in menu items' );

	menuSetter.setRequiresUser( this.menu, true );
};

AppMenu.prototype.disableLoggedInItems = function () {
	log.info( 'Disabling logged in menu items' );

	menuSetter.setRequiresUser( this.menu, false );
};

if ( ! appMenu ) {
	appMenu = new AppMenu();
}

module.exports = appMenu;
