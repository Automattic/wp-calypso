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
	page( '/plugins/setup', siteSelection, renderProvisionPlugins, makeLayout, clientRender );

	page( '/plugins/setup/:site', siteSelection, renderProvisionPlugins, makeLayout, clientRender );

	page(
		'/plugins/browse/:category/:site?',
		siteSelection,
		navigation,
		browsePlugins,
		makeLayout,
		clientRender
	);

	page( '/plugins/upload', siteSelection, sites, makeLayout, clientRender );
	page( '/plugins/upload/:site_id', siteSelection, navigation, upload, makeLayout, clientRender );

	page( '/plugins', siteSelection, navigation, browsePlugins, makeLayout, clientRender );

	page( '/plugins/manage/:site?', siteSelection, navigation, plugins, makeLayout, clientRender );

	page(
		'/plugins/:pluginFilter(active|inactive|updates)/:site_id?',
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
		siteSelection,
		navigation,
		renderPluginWarnings,
		makeLayout,
		clientRender
	);
}
