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

export default function() {

	if ( config.isEnabled( 'manage/media' ) ) {
		page( '/media', controller.siteSelection, controller.sites );
		page( '/media/:filter?/:domain', controller.siteSelection, controller.navigation, mediaController.media );
	}

};
