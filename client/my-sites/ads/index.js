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
	page(
	 '/ads',
	 controller.siteSelection,
	 controller.sites,
	 makeLayout,
	 clientRender
	);
	page('/ads/:site_id', adsController.redirect, makeLayout, clientRender);
	page(
	 '/ads/:section/:site_id',
	 controller.siteSelection,
	 controller.navigation,
	 adsController.layout,
	 makeLayout,
	 clientRender
	);
};
