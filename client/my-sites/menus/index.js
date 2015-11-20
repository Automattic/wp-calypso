/**
 * External dependencies
 */
var page = require( 'page' );

/**
 * Internal dependencies
 */
var config = require( 'config' ),
	controller = require( 'my-sites/controller' ),
	menusController = require( './controller' );

module.exports = function() {
	if ( config.isEnabled( 'manage/menus' ) ) {
		page( '/menus/:site_id', controller.siteSelection, controller.navigation, menusController.menus );
		page( '/menus', controller.siteSelection, controller.sites );
	}
};
