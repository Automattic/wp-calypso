import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { siteSelection, sites } from 'calypso/my-sites/controller';
import {
	browsePlugins,
	browsePluginsOrPlugin,
	renderPluginWarnings,
	renderProvisionPlugins,
	jetpackCanUpdate,
	plugins,
	scrollTopIfNoHash,
	upload,
	navigationIfLoggedIn,
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

	page(
		'/plugins/browse/:category/:site?',
		scrollTopIfNoHash,
		siteSelection,
		navigationIfLoggedIn,
		browsePlugins,
		makeLayout,
		clientRender
	);

	page( '/plugins/upload', scrollTopIfNoHash, siteSelection, sites, makeLayout, clientRender );
	page(
		'/plugins/upload/:site_id',
		scrollTopIfNoHash,
		siteSelection,
		navigationIfLoggedIn,
		upload,
		makeLayout,
		clientRender
	);

	page(
		'/plugins',
		scrollTopIfNoHash,
		siteSelection,
		navigationIfLoggedIn,
		browsePlugins,
		makeLayout,
		clientRender
	);

	page(
		'/plugins/manage/:site?',
		scrollTopIfNoHash,
		siteSelection,
		navigationIfLoggedIn,
		plugins,
		makeLayout,
		clientRender
	);

	page(
		'/plugins/:pluginFilter(active|inactive|updates)/:site_id?',
		scrollTopIfNoHash,
		siteSelection,
		navigationIfLoggedIn,
		jetpackCanUpdate,
		plugins,
		makeLayout,
		clientRender
	);

	page(
		'/plugins/:plugin/:site_id?',
		scrollTopIfNoHash,
		siteSelection,
		navigationIfLoggedIn,
		browsePluginsOrPlugin,
		makeLayout,
		clientRender
	);

	page(
		'/plugins/:plugin/eligibility/:site_id',
		scrollTopIfNoHash,
		siteSelection,
		navigationIfLoggedIn,
		renderPluginWarnings,
		makeLayout,
		clientRender
	);
}
