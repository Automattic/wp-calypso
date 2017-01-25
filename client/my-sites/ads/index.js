/**
 * External dependencies
 */
var page = require( 'page' );

/**
 * Internal dependencies
 */
var controller = require( 'my-sites/controller' ),
	adsController = require( './controller' );

module.exports = function() {
	page( '/ads', controller.siteSelection, controller.sites );
	page( '/ads/:site_id', adsController.redirect );
	page( '/ads/:section/:site_id', controller.siteSelection, controller.navigation, adsController.layout );
};
