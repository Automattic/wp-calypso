/**
 * External dependencies
 */
var page = require( 'page' );

/**
 * Internal dependencies
 */
var config = require( 'config' ),
	sitesController = require( 'my-sites/controller' ),
	controller = require( './controller' );

module.exports = function() {
	if ( config.isEnabled( 'post-editor' ) ) {
		page( '/post', controller.pressThis, sitesController.siteSelection, sitesController.sites );
		page( '/post/new', () => page.redirect( '/post' ) ); // redirect from beep-beep-boop
		page( '/post/:site?/:post?', sitesController.siteSelection, sitesController.fetchJetpackSettings, controller.post );
	}

	if ( config.isEnabled( 'post-editor/pages' ) ) {
		page( '/page', sitesController.siteSelection, sitesController.sites );
		page( '/page/new', () => page.redirect( '/page' ) ); // redirect from beep-beep-boop
		page( '/page/:site?/:post?', sitesController.siteSelection, sitesController.fetchJetpackSettings, controller.post );
	}
};
