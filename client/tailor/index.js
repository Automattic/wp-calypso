/**
 * External dependencies
 */
var page = require( 'page' );

/**
 * Internal dependencies
 */
var controller = require( 'my-sites/controller' ),
	tailorController = require( './controller' ),
	config = require( 'config' );

module.exports = function() {
	if ( config.isEnabled( 'tailor' ) ) {
		page( '/tailor', controller.siteSelection, controller.sites );
		page( '/tailor/:domain', controller.siteSelection, controller.navigation, tailorController.tailor );
	}
};
