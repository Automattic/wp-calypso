/**
 * External dependencies
 */
var page = require( 'page' );

/**
 * Internal dependencies
 */
var controller = require( 'my-sites/controller' ),
	mediaController = require( './controller' ),
	config = require( 'config' );

module.exports = function() {

	if ( config.isEnabled( 'manage/media' ) ) {
		page(
		    '/media',
			controller.siteSelection,
			controller.sites,
			makeLayout,
			clientRender
		);
		page(
		    '/media/:filter?/:domain',
			controller.siteSelection,
			controller.navigation,
			mediaController.media,
			makeLayout,
			clientRender
		);
	}

};
