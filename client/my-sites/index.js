/**
 * External dependencies
 */
var page = require( 'page' );

/**
 * Internal dependencies
 */
var controller = require( './controller' ),
	removeOverlay = require( 'remove-overlay' );

module.exports = function() {

	page( '/sites/:sitesFilter?', controller.siteSelection, removeOverlay, controller.sites );

};
