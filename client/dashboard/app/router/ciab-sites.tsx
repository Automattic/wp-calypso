import {
	isAutomatticianQuery,
	rawUserPreferencesQuery,
	sitesQuery,
	queryClient,
} from '@automattic/api-queries';
import { createRoute, createLazyRoute } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { rootRoute } from './root';
import {
	siteRoute as ciabSiteRoute,
	siteOverviewRoute,
	siteSettingsRoute,
	siteSettingsIndexRoute,
	siteSettingsSiteVisibilityRoute,
	siteSettingsSubscriptionGiftingRoute,
	siteSettingsDatabaseRoute,
	siteSettingsWordPressRoute,
	siteSettingsPHPRoute,
	siteSettingsAgencyRoute,
	siteSettingsRepositoriesRoute,
	siteSettingsRepositoriesIndexRoute,
	siteSettingsRepositoriesConnectRoute,
	siteSettingsRepositoriesManageRoute,
	siteSettingsHundredYearPlanRoute,
	siteSettingsPrimaryDataCenterRoute,
	siteSettingsStaticFile404Route,
	siteSettingsCachingRoute,
	siteSettingsDefensiveModeRoute,
	siteSettingsTransferSiteRoute,
	siteSettingsSftpSshRoute,
	siteSettingsWebApplicationFirewallRoute,
	siteSettingsWpcomLoginRoute,
	siteTrialEndedRoute,
	siteDifmLiteInProgressRoute,
	siteMigrationOverviewRoute,
} from './sites';
import type { AppConfig } from '../context';
import type { AnyRoute } from '@tanstack/react-router';

export const ciabSitesRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Stores' ),
			},
		],
	} ),
	getParentRoute: () => rootRoute,
	path: 'sites',
	loader: async () => {
		// Preload the default sites list response without blocking.
		queryClient.ensureQueryData( sitesQuery() );

		await Promise.all( [
			queryClient.ensureQueryData( isAutomatticianQuery() ),
			queryClient.ensureQueryData( rawUserPreferencesQuery() ),
		] );
	},
	validateSearch: ( search ) => {
		// Deserialize the view search param if it exists on the first page load.
		if ( typeof search.view === 'string' ) {
			let parsedView;
			try {
				parsedView = JSON.parse( search.view );
			} catch ( e ) {
				// pass
			}
			return { ...search, view: parsedView };
		}
		return search;
	},
} ).lazy( () =>
	import( '../../ciab-sites' ).then( ( d ) =>
		createLazyRoute( 'ciab-sites' )( {
			component: d.default,
		} )
	)
);

export const createCIABSitesRoutes = ( config: AppConfig ) => {
	if ( ! config.supports.ciabSites ) {
		return [];
	}

	const ciabSiteRoutes: AnyRoute[] = [
		siteOverviewRoute,
		siteSettingsRoute.addChildren( [
			siteSettingsIndexRoute,
			siteSettingsSiteVisibilityRoute,
			siteSettingsSubscriptionGiftingRoute,
			siteSettingsDatabaseRoute,
			siteSettingsWordPressRoute,
			siteSettingsPHPRoute,
			siteSettingsAgencyRoute,
			siteSettingsRepositoriesRoute.addChildren( [
				siteSettingsRepositoriesIndexRoute,
				siteSettingsRepositoriesConnectRoute,
				siteSettingsRepositoriesManageRoute,
			] ),
			siteSettingsHundredYearPlanRoute,
			siteSettingsPrimaryDataCenterRoute,
			siteSettingsStaticFile404Route,
			siteSettingsCachingRoute,
			siteSettingsDefensiveModeRoute,
			siteSettingsTransferSiteRoute,
			siteSettingsSftpSshRoute,
			siteSettingsWebApplicationFirewallRoute,
			siteSettingsWpcomLoginRoute,
		] ),
		siteTrialEndedRoute,
		siteDifmLiteInProgressRoute,
		siteMigrationOverviewRoute,
	];

	return [ ciabSitesRoute, ciabSiteRoute.addChildren( ciabSiteRoutes ) ];
};
