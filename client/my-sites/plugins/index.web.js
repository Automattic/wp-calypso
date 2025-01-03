import { isEnabled } from '@automattic/calypso-config';
import { getLanguageRouteParam } from '@automattic/i18n-utils';
import {
	makeLayout,
	notFound,
	redirectLoggedOut,
	redirectWithoutLocaleParamIfLoggedIn,
	render as clientRender,
	redirectIfCurrentUserCannot,
} from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import {
	renderPluginsDashboard,
	browsePlugins,
	browsePluginsOrPlugin,
	renderPluginWarnings,
	renderProvisionPlugins,
	jetpackCanUpdate,
	plugins,
	scheduledUpdates,
	scheduledUpdatesMultisite,
	relatedPlugins,
	redirectTrialSites,
	redirectMailPoetUpgrade,
	scrollTopIfNoHash,
	navigationIfLoggedIn,
	maybeRedirectLoggedOut,
	redirectStagingSites,
	renderPluginsSidebar,
} from './controller';
import { maybeShowUpgradeSuccessNotice, plans, upload } from './controller-logged-in';

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
		renderPluginsSidebar,
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
		maybeShowUpgradeSuccessNotice,
		clientRender
	);

	router(
		`/${ langParam }/plugins`,
		redirectWithoutLocaleParamIfLoggedIn,
		scrollTopIfNoHash,
		siteSelection,
		navigationIfLoggedIn,
		renderPluginsSidebar,
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
		`/${ langParam }/plugins/manage/sites`,
		redirectLoggedOut,
		redirectWithoutLocaleParamIfLoggedIn,
		scrollTopIfNoHash,
		navigation,
		redirectTrialSites,
		renderPluginsSidebar,
		renderPluginsDashboard,
		makeLayout,
		clientRender
	);

	router(
		`/${ langParam }/plugins/manage/sites/:slug`,
		redirectLoggedOut,
		redirectWithoutLocaleParamIfLoggedIn,
		scrollTopIfNoHash,
		navigation,
		redirectTrialSites,
		renderPluginsSidebar,
		renderPluginsDashboard,
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
		renderPluginsSidebar,
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
		renderPluginsSidebar,
		plugins,
		makeLayout,
		clientRender
	);

	if ( isEnabled( 'plugins/multisite-scheduled-updates' ) ) {
		router(
			[
				`/${ langParam }/plugins/scheduled-updates`,
				`/${ langParam }/plugins/scheduled-updates/:action(create)`,
				`/${ langParam }/plugins/scheduled-updates/:action(edit)/:id`,
			],
			redirectLoggedOut,
			navigation,
			renderPluginsSidebar,
			scheduledUpdatesMultisite,
			makeLayout,
			clientRender
		);
	}

	router(
		[
			`/${ langParam }/plugins/scheduled-updates/:site_slug?`,
			`/${ langParam }/plugins/scheduled-updates/:action/:site_slug?`,
			`/${ langParam }/plugins/scheduled-updates/:action/:site_slug?/:schedule_id`,
		],
		redirectLoggedOut,
		siteSelection,
		redirectIfCurrentUserCannot( 'update_plugins' ),
		redirectStagingSites,
		navigation,
		scheduledUpdates,
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
		renderPluginsSidebar,
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
		renderPluginsSidebar,
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
