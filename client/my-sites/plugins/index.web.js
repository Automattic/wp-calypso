import { getLanguageRouteParam } from '@automattic/i18n-utils';
import {
	makeLayout,
	redirectLoggedOut,
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
	maybeRedirectLoggedOut,
} from './controller';
import { upload } from './controller-logged-in';

export default function ( router ) {
	const langParam = getLanguageRouteParam();

	router(
		'/plugins/setup',
		redirectLoggedOut,
		scrollTopIfNoHash,
		siteSelection,
		renderProvisionPlugins,
		makeLayout,
		clientRender
	);

	router(
		'/plugins/setup/:site',
		redirectLoggedOut,
		scrollTopIfNoHash,
		siteSelection,
		renderProvisionPlugins,
		makeLayout,
		clientRender
	);

	router(
		`/${ langParam }/plugins/browse/:category/:site?`,
		maybeRedirectLoggedOut,
		redirectWithoutLocaleParamIfLoggedIn,
		scrollTopIfNoHash,
		siteSelection,
		navigationIfLoggedIn,
		browsePlugins,
		makeLayout,
		clientRender
	);

	router(
		'/plugins/upload',
		redirectLoggedOut,
		scrollTopIfNoHash,
		siteSelection,
		sites,
		makeLayout,
		clientRender
	);
	router(
		'/plugins/upload/:site_id',
		redirectLoggedOut,
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

	router(
		'/plugins/manage/:site?',
		redirectLoggedOut,
		scrollTopIfNoHash,
		siteSelection,
		navigation,
		plugins,
		makeLayout,
		clientRender
	);

	router(
		'/plugins/:pluginFilter(active|inactive|updates)/:site_id?',
		maybeRedirectLoggedOut,
		scrollTopIfNoHash,
		siteSelection,
		navigation,
		jetpackCanUpdate,
		plugins,
		makeLayout,
		clientRender
	);

	router(
		`/${ langParam }/plugins/:plugin/:site_id?`,
		maybeRedirectLoggedOut,
		redirectWithoutLocaleParamIfLoggedIn,
		scrollTopIfNoHash,
		siteSelection,
		navigationIfLoggedIn,
		browsePluginsOrPlugin,
		makeLayout,
		clientRender
	);

	router(
		'/plugins/:plugin/eligibility/:site_id',
		redirectLoggedOut,
		scrollTopIfNoHash,
		siteSelection,
		navigation,
		renderPluginWarnings,
		makeLayout,
		clientRender
	);

	router( [ `/${ langParam }/plugins`, `/${ langParam }/plugins/*` ], redirectLoggedOut );
}
