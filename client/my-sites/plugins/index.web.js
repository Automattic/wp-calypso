import { getLanguageRouteParam } from '@automattic/i18n-utils';
import page from 'page';
import {
	makeLayout,
	redirectWithoutLocaleParamIfLoggedIn,
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
	navigationIfLoggedIn,
} from './controller';
import { upload } from './controller-logged-in';

export default function ( router ) {
	const siteId =
		'\\d+' + // numeric site id
		'|' + // or
		'[^\\\\/.]+\\.[^\\\\/]+'; // one-or-more non-slash-or-dot chars, then a dot, then one-or-more non-slashes
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

	router(
		`/${ langParam }/plugins/browse/:category/:site(${ siteId })?`,
		redirectWithoutLocaleParamIfLoggedIn,
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
		navigation,
		upload,
		makeLayout,
		clientRender
	);

	router(
		`/${ langParam }/plugins`,
		redirectWithoutLocaleParamIfLoggedIn,
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

	router(
		`/${ langParam }/plugins/:plugin/:site_id(${ siteId })?`,
		redirectWithoutLocaleParamIfLoggedIn,
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
		navigation,
		renderPluginWarnings,
		makeLayout,
		clientRender
	);
}
