/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import pluginsController from './controller';
import config from 'config';
import controller from 'my-sites/controller';
import { recordTracksEvent } from 'state/analytics/actions';
import { getSelectedSite } from 'state/ui/selectors';

const nonJetpackRedirectTo = path => ( context, next ) => {
	const site = getSelectedSite( context.store.getState() );

	if ( site.jetpack ) {
		page.redirect( `${ path }/${ site.slug }` );
	}

	next();
};

export default function() {
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
		page( '/plugins/wpcom-masterbar-redirect/:site', context => {
			context.store.dispatch( recordTracksEvent( 'calypso_wpcom_masterbar_plugins_view_click' ) );
			page.redirect( '/plugins/' + context.params.site );
		} );

		page( '/plugins/browse/wpcom-masterbar-redirect/:site', context => {
			context.store.dispatch( recordTracksEvent( 'calypso_wpcom_masterbar_plugins_add_click' ) );
			page.redirect( '/plugins/browse/' + context.params.site );
		} );

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
			nonJetpackRedirectTo( '/plugins/manage' ),
			pluginsController.plugins.bind( null, 'all' ),
		);

		if ( config.isEnabled( 'manage/plugins/upload' ) ) {
			page( '/plugins/upload', controller.sites );
			page( '/plugins/upload/:site_id',
				controller.siteSelection,
				controller.navigation,
				pluginsController.upload
			);
		}

		page( '/plugins',
			controller.siteSelection,
			controller.navigation,
			pluginsController.browsePlugins
		);

		page( '/plugins/manage/:site?',
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
				pluginsController.plugins.bind( null, filter ),
				controller.sites
			)
		) );

		page( '/plugins/:plugin/:site_id?',
			controller.siteSelection,
			controller.navigation,
			pluginsController.plugin
		);

		page( '/plugins/:plugin/eligibility/:site_id',
			controller.siteSelection,
			controller.navigation,
			pluginsController.eligibility
		);

		page.exit( '/plugins/*', ( context, next ) => {
			if ( 0 !== page.current.indexOf( '/plugins/' ) ) {
				pluginsController.resetHistory();
			}

			next();
		} );
	}
}
