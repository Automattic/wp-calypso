import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller';
import {
	navigation,
	siteSelection,
	sites,
	selectSiteIfLoggedIn,
} from 'calypso/my-sites/controller';
import {
	renderPlugin,
	renderBrowsePlugins,
	renderPluginWarnings,
	renderProvisionPlugins,
	jetpackCanUpdate,
	renderPlugins,
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

	page(
		'/plugins/browse/:category/:site',
		scrollTopIfNoHash,
		siteSelection,
		navigation,
		renderBrowsePlugins,
		makeLayout,
		clientRender
	);
	page(
		'/plugins/browse/:category',
		scrollTopIfNoHash,
		siteSelection,
		sites,
		makeLayout,
		clientRender
	);

	page(
		'/plugins/upload/:site',
		scrollTopIfNoHash,
		siteSelection,
		navigation,
		upload,
		makeLayout,
		clientRender
	);
	page( '/plugins/upload', scrollTopIfNoHash, siteSelection, sites, makeLayout, clientRender );

	page(
		'/plugins/manage/:site',
		scrollTopIfNoHash,
		siteSelection,
		navigation,
		renderPlugins,
		makeLayout,
		clientRender
	);
	page(
		'/plugins/:pluginFilter(active|inactive|updates)/:site',
		scrollTopIfNoHash,
		siteSelection,
		navigation,
		jetpackCanUpdate,
		renderPlugins,
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
	page(
		'/plugins/:plugin/:site',
		scrollTopIfNoHash,
		siteSelection,
		navigation,
		renderPlugin,
		makeLayout,
		clientRender
	);

	page(
		'/plugins/:site',
		scrollTopIfNoHash,
		siteSelection,
		navigation,
		renderBrowsePlugins,
		makeLayout,
		clientRender
	);
	page( '/plugins', selectSiteIfLoggedIn, navigation, makeLayout, clientRender );
}
