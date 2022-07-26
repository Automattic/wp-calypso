import { makeLayout, ssrSetupLocale } from 'calypso/controller';
import { navigation, siteSelection } from 'calypso/my-sites/controller';
import {
	browsePlugins,
	browsePluginsOrPlugin,
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
		'/plugins/browse/:category/:site?',
		ssrSetupLocale,
		siteSelection,
		navigation,
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

	router( '/plugins', ssrSetupLocale, browsePlugins, makeLayout );

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
	// 	scrollTopIfNoHash,
	// 	siteSelection,
	// 	navigation,
	// 	jetpackCanUpdate,
	// 	plugins,
	// 	makeLayout,
	// 	clientRender
	// );

	router( '/plugins/:plugin', ssrSetupLocale, navigation, browsePluginsOrPlugin, makeLayout );

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
