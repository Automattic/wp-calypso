import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
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
		'/plugins/upload/:site_id',
		scrollTopIfNoHash,
		siteSelection,
		navigation,
		upload,
		makeLayout,
		clientRender
	);

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
		renderPluginWarnings,
		makeLayout,
		clientRender
	);
}
