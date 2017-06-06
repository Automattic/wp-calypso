'use strict';

/**
 * External Dependencies
 */
const Menu = require( 'electron' ).Menu;
const debug = require( 'debug' )( 'desktop:menu' );

/**
 * Internal dependencies
 */
const template = require( './main-menu' );
const menuSetter = require( 'lib/menu-setter' );

/**
 * Module variables
 */
let appMenu = false;

function AppMenu() {
	this.menu = false;
}

AppMenu.prototype.set = function( app, mainWindow ) {
	this.menu = Menu.buildFromTemplate( template( app, mainWindow ) )

	Menu.setApplicationMenu( this.menu );
};

AppMenu.prototype.enableLoggedInItems = function() {
	debug( 'Enabling logged in menu items' );

	menuSetter.setRequiresUser( this.menu, true );
};

AppMenu.prototype.disableLoggedInItems = function() {
	debug( 'Disabling logged in menu items' );

	menuSetter.setRequiresUser( this.menu, false );
};

if ( ! appMenu ) {
	appMenu = new AppMenu();
}

module.exports = appMenu;
