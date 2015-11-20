/**
 * External dependencies
 */
var page = require( 'page' );

/**
 * Internal dependencies
 */
var controller = require( 'my-sites/controller' ),
	customizeController = require( './controller' ),
	config = require( 'config' );

module.exports = function() {
	if ( config.isEnabled( 'manage/customize' ) ) {
		page( '/customize', controller.siteSelection, controller.sites );
		page( '/customize/:domain', controller.siteSelection, controller.navigation, customizeController.customize );
	}
};
