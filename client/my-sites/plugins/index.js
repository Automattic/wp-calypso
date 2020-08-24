/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { navigation, siteSelection, sites } from 'my-sites/controller';
import config from 'config';
import {
	browsePlugins,
	browsePluginsOrPlugin,
	eligibility,
	jetpackCanUpdate,
	plugins,
	resetHistory,
	scrollTopIfNoHash,
	setupPlugins,
	upload,
} from './controller';
import { recordTracksEvent } from 'state/analytics/actions';
import { makeLayout, render as clientRender } from 'controller';

export default function () {
	if ( config.isEnabled( 'manage/plugins/setup' ) ) {
		page(
			'/plugins/setup',
			scrollTopIfNoHash,
			siteSelection,
			setupPlugins,
			makeLayout,
			clientRender
		);

		page(
			'/plugins/setup/:site',
			scrollTopIfNoHash,
			siteSelection,
			setupPlugins,
			makeLayout,
			clientRender
		);
	}

	if ( config.isEnabled( 'manage/plugins' ) ) {
		page( '/plugins/wpcom-masterbar-redirect/:site', ( context ) => {
			context.store.dispatch( recordTracksEvent( 'calypso_wpcom_masterbar_plugins_view_click' ) );
			page.redirect( `/plugins/${ context.params.site }` );
		} );

		page( '/plugins/browse/wpcom-masterbar-redirect/:site', ( context ) => {
			context.store.dispatch( recordTracksEvent( 'calypso_wpcom_masterbar_plugins_add_click' ) );
			page.redirect( `/plugins/browse/${ context.params.site }` );
		} );

		page( '/plugins/manage/wpcom-masterbar-redirect/:site', ( context ) => {
			context.store.dispatch( recordTracksEvent( 'calypso_wpcom_masterbar_plugins_manage_click' ) );
			page.redirect( `/plugins/manage/${ context.params.site }` );
		} );

		page( '/plugins/browse/:category/:site', ( context ) => {
			const { category, site } = context.params;
			page.redirect( `/plugins/${ category }/${ site }` );
		} );

		page( '/plugins/browse/:siteOrCategory?', ( context ) => {
			const { siteOrCategory } = context.params;
			page.redirect( '/plugins' + ( siteOrCategory ? '/' + siteOrCategory : '' ) );
		} );

		if ( config.isEnabled( 'manage/plugins/upload' ) ) {
			page( '/plugins/upload', scrollTopIfNoHash, siteSelection, sites, makeLayout, clientRender );
			page(
				'/plugins/upload/:site_id',
				scrollTopIfNoHash,
				siteSelection,
				navigation,
				upload,
				makeLayout,
				clientRender
			);
		}

		page(
			'/plugins',
			scrollTopIfNoHash,
			siteSelection,
			navigation,
			browsePlugins,
			makeLayout,
			clientRender
		);

		page(
			'/plugins/manage/:site?',
			scrollTopIfNoHash,
			siteSelection,
			navigation,
			plugins,
			makeLayout,
			clientRender
		);

		page(
			'/plugins/:pluginFilter(active|inactive|updates)/:site_id?',
			scrollTopIfNoHash,
			siteSelection,
			navigation,
			jetpackCanUpdate,
			plugins,
			makeLayout,
			clientRender
		);

		page(
			'/plugins/:plugin/:site_id?',
			scrollTopIfNoHash,
			siteSelection,
			navigation,
			browsePluginsOrPlugin,
			makeLayout,
			clientRender
		);

		page(
			'/plugins/:plugin/eligibility/:site_id',
			scrollTopIfNoHash,
			siteSelection,
			navigation,
			eligibility,
			makeLayout,
			clientRender
		);

		page.exit( '/plugins/*', ( context, next ) => {
			if ( 0 !== page.current.indexOf( '/plugins/' ) ) {
				resetHistory();
			}

			next();
		} );
	}
}
