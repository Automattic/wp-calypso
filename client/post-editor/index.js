/**
 * External dependencies
 */
var page = require( 'page' );

/**
 * Internal dependencies
 */
var sitesController = require( 'my-sites/controller' ),
	controller = require( './controller' );
import config from 'config';

import { makeLayout, render as clientRender } from 'controller';

module.exports = function() {
	page(
	    '/post',
		controller.pressThis,
		sitesController.siteSelection,
		sitesController.sites,
		makeLayout,
		clientRender
	);
	page('/post/new', () => page.redirect( '/post' ), makeLayout, clientRender); // redirect from beep-beep-boop
	page(
	    '/post/:site?/:post?',
		sitesController.siteSelection,
		sitesController.fetchJetpackSettings,
		controller.post,
		makeLayout,
		clientRender
	);
	page.exit( '/post/:site?/:post?', controller.exitPost );

	page(
	    '/page',
		sitesController.siteSelection,
		sitesController.sites,
		makeLayout,
		clientRender
	);
	page('/page/new', () => page.redirect( '/page' ), makeLayout, clientRender); // redirect from beep-beep-boop
	page(
	    '/page/:site?/:post?',
		sitesController.siteSelection,
		sitesController.fetchJetpackSettings,
		controller.post,
		makeLayout,
		clientRender
	);
	page.exit( '/page/:site?/:post?', controller.exitPost );

	if ( config.isEnabled( 'manage/custom-post-types' ) ) {
		page(
		    '/edit/:type',
			sitesController.siteSelection,
			sitesController.sites,
			makeLayout,
			clientRender
		);
		page(
		    '/edit/:type/new',
			( context ) => page.redirect( `/edit/${ context.params.type }` ),
			makeLayout,
			clientRender
		);
		page(
		    '/edit/:type/:site?/:post?',
			sitesController.siteSelection,
			sitesController.fetchJetpackSettings,
			controller.post,
			makeLayout,
			clientRender
		);
		page.exit( '/edit/:type/:site?/:post?', controller.exitPost );
	}
};
