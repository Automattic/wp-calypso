import { getLanguageRouteParam } from '@automattic/i18n-utils';
import {
	makeLayout,
	notFound,
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
	updatesManager,
	relatedPlugins,
	redirectTrialSites,
	redirectMailPoetUpgrade,
	scrollTopIfNoHash,
	navigationIfLoggedIn,
	maybeRedirectLoggedOut,
} from './controller';
import { plans, upload } from './controller-logged-in';

export default function ( router ) {
	const langParam = getLanguageRouteParam();

	router(
		`/${ langParam }/plugins/setup`,
		redirectLoggedOut,
		redirectWithoutLocaleParamIfLoggedIn,
		scrollTopIfNoHash,
		siteSelection,
		renderProvisionPlugins,
		makeLayout,
		clientRender
	);

	router(
		`/${ langParam }/plugins/setup/:site`,
		redirectLoggedOut,
		redirectWithoutLocaleParamIfLoggedIn,
		scrollTopIfNoHash,
		siteSelection,
		renderProvisionPlugins,
		redirectTrialSites,
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
		redirectTrialSites,
		browsePlugins,
		makeLayout,
		clientRender
	);

	router(
		`/${ langParam }/plugins/upload`,
		redirectLoggedOut,
		redirectWithoutLocaleParamIfLoggedIn,
		scrollTopIfNoHash,
		siteSelection,
		sites,
		makeLayout,
		clientRender
	);
	router(
		`/${ langParam }/plugins/upload/:site_id`,
		redirectLoggedOut,
		redirectWithoutLocaleParamIfLoggedIn,
		scrollTopIfNoHash,
		siteSelection,
		navigation,
		redirectTrialSites,
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

	router( `/${ langParam }/plugins/plans`, notFound, makeLayout );

	router(
		`/${ langParam }/plugins/plans/:pluginSlug?/:intervalType(yearly|monthly)/:site`,
		redirectWithoutLocaleParamIfLoggedIn,
		redirectLoggedOut,
		scrollTopIfNoHash,
		siteSelection,
		navigation,
		redirectTrialSites,
		plans,
		makeLayout,
		clientRender
	);

	router(
		`/${ langParam }/plugins/manage/:site?`,
		redirectLoggedOut,
		redirectWithoutLocaleParamIfLoggedIn,
		scrollTopIfNoHash,
		siteSelection,
		navigation,
		redirectTrialSites,
		plugins,
		makeLayout,
		clientRender
	);

	router(
		`/${ langParam }/plugins/:pluginFilter(active|inactive|updates)/:site_id?`,
		redirectLoggedOut,
		redirectWithoutLocaleParamIfLoggedIn,
		scrollTopIfNoHash,
		siteSelection,
		navigation,
		redirectTrialSites,
		jetpackCanUpdate,
		plugins,
		makeLayout,
		clientRender
	);

	router(
		[
			`/${ langParam }/plugins/update-manager/:site_slug?`,
			`/${ langParam }/plugins/update-manager/:action/:site_slug?`,
		],
		redirectLoggedOut,
		siteSelection,
		navigation,
		updatesManager,
		makeLayout,
		clientRender
	);

	// This rule needs to preceed the one below, to work
	// when the site_id parameter is omitted.
	router(
		`/${ langParam }/plugins/:plugin/related/:site_id?`,
		maybeRedirectLoggedOut,
		redirectWithoutLocaleParamIfLoggedIn,
		scrollTopIfNoHash,
		siteSelection,
		navigationIfLoggedIn,
		redirectTrialSites,
		relatedPlugins,
		makeLayout,
		clientRender
	);

	router(
		`/${ langParam }/plugins/mailpoet-business/upgrade/:site_id`,
		redirectLoggedOut,
		redirectWithoutLocaleParamIfLoggedIn,
		scrollTopIfNoHash,
		siteSelection,
		navigation,
		redirectTrialSites,
		redirectMailPoetUpgrade,
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
		redirectTrialSites,
		browsePluginsOrPlugin,
		makeLayout,
		clientRender
	);

	router(
		`/${ langParam }/plugins/:plugin/eligibility/:site_id`,
		redirectLoggedOut,
		redirectWithoutLocaleParamIfLoggedIn,
		scrollTopIfNoHash,
		siteSelection,
		navigation,
		redirectTrialSites,
		renderPluginWarnings,
		makeLayout,
		clientRender
	);

	router( [ `/${ langParam }/plugins`, `/${ langParam }/plugins/*` ], redirectLoggedOut );
}
