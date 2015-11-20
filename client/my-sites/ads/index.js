/**
 * External dependencies
 */
var page = require( 'page' );

/**
 * Internal dependencies
 */
var controller = require( 'my-sites/controller' ),
	adsController = require( './controller' ),
	config = require( 'config' );

module.exports = function() {
	if ( config.isEnabled( 'manage/ads' ) ) {
		page( '/ads', controller.siteSelection, controller.sites );
		page( '/ads/:site_id', adsController.redirect );
		page( '/ads/:section/:site_id', controller.siteSelection, controller.navigation, adsController.layout );
	}
};
