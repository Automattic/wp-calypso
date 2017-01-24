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

const nonJetpackRedirectTo = path => ( context, next ) => {
	const site = getSelectedSite( context.store.getState() );

	if ( site.jetpack ) {
		page.redirect( `${ path }/${ site.slug }` );
	}

	next();
};

module.exports = function() {
	if ( config.isEnabled( 'manage/plugins/setup' ) ) {
		page( '/plugins/setup',
			controller.siteSelection,
			pluginsController.setupPlugins
		);

		page( '/plugins/setup/:site',
			controller.siteSelection,
			pluginsController.setupPlugins
		);
	}

	if ( config.isEnabled( 'manage/plugins' ) ) {
		page( '/plugins/browse/:category/:site',
			controller.siteSelection,
			controller.navigation,
			pluginsController.browsePlugins
		);

		page( '/plugins/browse/:siteOrCategory?',
			controller.siteSelection,
			controller.navigation,
			pluginsController.browsePlugins
		);

		page( '/plugins/category/:category/:site_id',
			controller.siteSelection,
			controller.navigation,
			nonJetpackRedirectTo( '/plugins' ),
			pluginsController.plugins.bind( null, 'all' ),
		);

		page( '/plugins',
			controller.siteSelection,
			controller.navigation,
			pluginsController.plugins.bind( null, 'all' ),
			controller.sites
		);

		[ 'active', 'inactive', 'updates' ].forEach( filter => (
			page( `/plugins/${ filter }/:site_id?`,
				controller.siteSelection,
				controller.navigation,
				pluginsController.jetpackCanUpdate.bind( null, filter ),
				pluginsController.plugins.bind( null, filter )
			)
		) );

		page( '/plugins/:plugin/:site_id?',
			controller.siteSelection,
			controller.navigation,
			pluginsController.plugin
		);

		if ( config.isEnabled( 'automated-transfer' ) ) {
			page( '/plugins/:plugin/eligibility/:site_id',
				controller.siteSelection,
				controller.navigation,
				pluginsController.eligibility
			);
		}

		page.exit( '/plugins*',
			pluginsController.resetHistory
		);
	}
};
