/**
 * External dependencies
 */
var page = require( 'page' );

/**
 * Internal dependencies
 */
var controller = require( 'my-sites/controller' ),
	draftsController = require( './controller' ),
	config = require( 'config' );

module.exports = function() {

	if ( config.isEnabled( 'manage/drafts' ) ) {
		page(
		    '/drafts/:domain?',
			controller.siteSelection,
			controller.navigation,
			draftsController.drafts,
			makeLayout,
			clientRender
		);
	}

};
