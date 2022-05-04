import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller';
import {
	navigation,
	siteSelection,
	sites,
	selectSiteIfLoggedIn,
} from 'calypso/my-sites/controller';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	browsePlugins,
	browsePluginsOrPlugin,
	renderPluginWarnings,
	renderProvisionPlugins,
	jetpackCanUpdate,
	plugins,
	scrollTopIfNoHash,
	upload,
} from './controller';

function trackViewRef( context, next ) {
	if ( context?.query?.ref === 'wpcom-masterbar-redirect' ) {
		context.store.dispatch( recordTracksEvent( 'calypso_wpcom_masterbar_plugins_view_click' ) );
	}
	next();
}

export default function () {
	page(
		'/plugins/setup',
		scrollTopIfNoHash,
		siteSelection,
		renderProvisionPlugins,
		makeLayout,
		clientRender
	);

	page(
		'/plugins/setup/:site',
		scrollTopIfNoHash,
		siteSelection,
		renderProvisionPlugins,
		makeLayout,
		clientRender
	);

	page( '/plugins/browse/:category/:site', ( context ) => {
		const { category, site } = context.params;
		page.redirect( `/plugins/${ category }/${ site }` );
	} );

	page( '/plugins/browse/:siteOrCategory?', ( context ) => {
		const { siteOrCategory } = context.params;
		page.redirect( '/plugins' + ( siteOrCategory ? '/' + siteOrCategory : '' ) );
	} );

	page( '/plugins/upload', scrollTopIfNoHash, siteSelection, sites, makeLayout, clientRender );
	page(
		'/plugins/upload/:site',
		scrollTopIfNoHash,
		siteSelection,
		navigation,
		upload,
		makeLayout,
		clientRender
	);

	page( '/plugins', selectSiteIfLoggedIn, navigation, makeLayout, clientRender );

	page(
		'/plugins/:site',
		scrollTopIfNoHash,
		siteSelection,
		trackViewRef,
		navigation,
		browsePlugins,
		makeLayout,
		clientRender
	);

	page(
		'/plugins/manage/:site',
		scrollTopIfNoHash,
		siteSelection,
		navigation,
		plugins,
		makeLayout,
		clientRender
	);

	page(
		'/plugins/:pluginFilter(active|inactive|updates)/:site',
		scrollTopIfNoHash,
		siteSelection,
		navigation,
		jetpackCanUpdate,
		plugins,
		makeLayout,
		clientRender
	);

	page(
		'/plugins/:plugin/:site',
		scrollTopIfNoHash,
		siteSelection,
		navigation,
		browsePluginsOrPlugin,
		makeLayout,
		clientRender
	);

	page(
		'/plugins/:plugin/eligibility/:site',
		scrollTopIfNoHash,
		siteSelection,
		navigation,
		renderPluginWarnings,
		makeLayout,
		clientRender
	);
}
