/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import controller from 'my-sites/controller';
import config from 'config';
import pluginsController from './controller';
import { getSelectedSite } from 'state/ui/selectors';

import { makeLayout, render as clientRender } from 'controller';

const nonJetpackRedirectTo = path => ( context, next ) => {
	const site = getSelectedSite( context.store.getState() );

	if ( site.jetpack ) {
		page.redirect( `${ path }/${ site.slug }` );
	}

	next();
};

module.exports = function() {
	if ( config.isEnabled( 'manage/plugins/setup' ) ) {
		page(
		    '/plugins/setup',
			controller.siteSelection,
			pluginsController.setupPlugins,
			makeLayout,
			clientRender
		);

		page(
		    '/plugins/setup/:site',
			controller.siteSelection,
			pluginsController.setupPlugins,
			makeLayout,
			clientRender
		);
	}

	if ( config.isEnabled( 'manage/plugins' ) ) {
		page(
		    '/plugins/browse/:category/:site',
			controller.siteSelection,
			controller.navigation,
			pluginsController.browsePlugins,
			makeLayout,
			clientRender
		);

		page(
		    '/plugins/browse/:siteOrCategory?',
			controller.siteSelection,
			controller.navigation,
			pluginsController.browsePlugins,
			makeLayout,
			clientRender
		);

		page(
		    '/plugins/category/:category/:site_id',
			controller.siteSelection,
			controller.navigation,
			nonJetpackRedirectTo( '/plugins' ),
			pluginsController.plugins.bind( null, 'all' ),
			makeLayout,
			clientRender
		);

		page(
		    '/plugins',
			controller.siteSelection,
			controller.navigation,
			pluginsController.plugins.bind( null, 'all' ),
			controller.sites,
			makeLayout,
			clientRender
		);

		[ 'active', 'inactive', 'updates' ].forEach( filter => (
			page(
			    `/plugins/${ filter }/:site_id?`,
				controller.siteSelection,
				controller.navigation,
				pluginsController.jetpackCanUpdate.bind( null, filter ),
				pluginsController.plugins.bind( null, filter ),
				makeLayout,
				clientRender
			)
		) );

		page(
		    '/plugins/:plugin/:site_id?',
			controller.siteSelection,
			controller.navigation,
			pluginsController.plugin,
			makeLayout,
			clientRender
		);

		page(
		    '/plugins/:plugin/eligibility/:site_id',
			controller.siteSelection,
			controller.navigation,
			pluginsController.eligibility,
			makeLayout,
			clientRender
		);

		page.exit( '/plugins*',
			pluginsController.resetHistory
		);
	}
};
