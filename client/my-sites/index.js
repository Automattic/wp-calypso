/**
 * External dependencies
 */
var page = require( 'page' );

/**
 * Internal dependencies
 */
var controller = require( './controller' ),
	removeOverlay = require( 'lib/remove-overlay' );

module.exports = function() {
	page( '/sites/:sitesFilter?', controller.siteSelection, removeOverlay, controller.sites );
};
