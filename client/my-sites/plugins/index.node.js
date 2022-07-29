import { makeLayout, ssrSetupLocale } from 'calypso/controller';
import {
	browsePlugins,
	browsePluginsOrPlugin,
	fetchPlugins,
	fetchPlugin,
	fetchCategoryPlugins,
	// renderPluginWarnings,
	// renderProvisionPlugins,
	// jetpackCanUpdate,
	// plugins,
	// scrollTopIfNoHash,
	// upload,
} from './controller-2';

export default function ( router ) {
	// router(
	// 	'/plugins/setup',
	// 	scrollTopIfNoHash,
	// 	siteSelection,
	// 	renderProvisionPlugins,
	// 	makeLayout,
	// 	clientRender
	// );

	// router(
	// 	'/plugins/setup/:site',
	// 	scrollTopIfNoHash,
	// 	siteSelection,
	// 	renderProvisionPlugins,
	// 	makeLayout,
	// 	clientRender
	// );

	router(
		'/plugins/browse/:category',
		ssrSetupLocale,
		fetchCategoryPlugins,
		browsePlugins,
		makeLayout
	);

	// router( '/plugins/upload', scrollTopIfNoHash, siteSelection, sites, makeLayout, clientRender );
	// router(
	// 	'/plugins/upload/:site_id',
	// 	scrollTopIfNoHash,
	// 	siteSelection,
	// 	navigation,
	// 	upload,
	// 	makeLayout,
	// 	clientRender
	// );

	router( '/plugins', ssrSetupLocale, fetchPlugins, browsePlugins, makeLayout );

	// router(
	// 	'/plugins/manage/:site?',
	// 	scrollTopIfNoHash,
	// 	siteSelection,
	// 	navigation,
	// 	plugins,
	// 	makeLayout,
	// 	clientRender
	// );

	// router(
	// 	'/plugins/:pluginFilter(active|inactive|updates)/:site_id?',
	// 	ssrSetupLocale,
	// 	plugins,
	// 	makeLayout
	// );

	router( '/plugins/:plugin', ssrSetupLocale, fetchPlugin, browsePluginsOrPlugin, makeLayout );

	// router(
	// 	'/plugins/:plugin/eligibility/:site_id',
	// 	scrollTopIfNoHash,
	// 	siteSelection,
	// 	navigation,
	// 	renderPluginWarnings,
	// 	makeLayout,
	// 	clientRender
	// );
}
