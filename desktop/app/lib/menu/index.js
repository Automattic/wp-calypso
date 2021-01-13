/**
 * External Dependencies
 */
const { Menu } = require( 'electron' );

/**
 * Internal dependencies
 */
const template = require( './main-menu' );
const menuSetter = require( 'app/lib/menu-setter' );
const log = require( 'app/lib/logger' )( 'desktop:menu' );

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
