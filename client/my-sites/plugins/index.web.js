import { getLanguageRouteParam } from '@automattic/i18n-utils';
import page from 'page';
import {
	makeLayout,
	redirectWithoutLocaleParamIfLoggedIn,
	redirectLoggedOut,
	render as clientRender,
} from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import {
	browsePlugins,
	browsePluginsOrPlugin,
	renderPluginWarnings,
	renderProvisionPlugins,
	jetpackCanUpdate,
	plugins,
	scrollTopIfNoHash,
} from './controller';
import { upload } from './controller-logged-in';

export default function ( router ) {
	const langParam = getLanguageRouteParam();

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

	router(
		`/${ langParam }/plugins/:plugin`,
		redirectWithoutLocaleParamIfLoggedIn,
		scrollTopIfNoHash,
		browsePluginsOrPlugin,
		makeLayout
	);

	router(
		`/${ langParam }/plugins/:plugin/:site_id`,
		redirectWithoutLocaleParamIfLoggedIn,
		redirectLoggedOut,
		scrollTopIfNoHash,
		siteSelection,
		navigation,
		browsePluginsOrPlugin,
		makeLayout
	);

	router(
		[ `/${ langParam }/plugins`, `/${ langParam }/plugins/browse/:category` ],
		redirectWithoutLocaleParamIfLoggedIn,
		scrollTopIfNoHash,
		browsePlugins,
		makeLayout
	);

	router(
		[ `/${ langParam }/plugins/:site_id`, `/${ langParam }/plugins/browse/:category/:site` ],
		redirectWithoutLocaleParamIfLoggedIn,
		redirectLoggedOut,
		scrollTopIfNoHash,
		siteSelection,
		navigation,
		browsePlugins,
		makeLayout
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
		'/plugins/:plugin/eligibility/:site_id',
		scrollTopIfNoHash,
		siteSelection,
		navigation,
		renderPluginWarnings,
		makeLayout,
		clientRender
	);
}
