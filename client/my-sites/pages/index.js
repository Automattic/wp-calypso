/**
 * External dependencies
 */
var page = require( 'page' );

/**
 * Internal dependencies
 */
var controller = require( 'my-sites/controller' ),
	pagesController = require( './controller' ),
	config = require( 'config' );

export default function() {
	if ( config.isEnabled( 'manage/pages' ) ) {
		page( '/pages/:status?/:domain?', controller.siteSelection, controller.navigation, pagesController.pages );
	}
};
