/**
 * Internal dependencies
 */
var config = require( 'config' ),
	controller = require( 'my-sites/controller' ),
	menusController = require( './controller' );

export default function( router ) {
	if ( config.isEnabled( 'manage/menus' ) ) {
		router( '/menus/:site_id', controller.siteSelection, controller.navigation, menusController.menus );
		router( '/menus', controller.siteSelection, controller.sites );
	}
};
