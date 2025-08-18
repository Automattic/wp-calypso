import { Router, createRoute, redirect, createLazyRoute } from '@tanstack/react-router';
import NotFound from '../404';
import UnknownError from '../500';
import { emailsQuery } from '../queries/emails';
import { queryClient } from '../query-client';
import { domainsRoute, domainRoute, domainChildRoutes } from './domains';
import { meRoute, meChildRoutes } from './me';
import { rootRoute } from './root';
import {
	sitesRoute,
	siteRoute,
	siteOverviewRoute,
	siteDeploymentsRoute,
	sitePerformanceRoute,
	siteMonitoringRoute,
	siteLogsRoute,
	siteLogsIndexRoute,
	siteLogsPhpRoute,
	siteLogsServerRoute,
	siteBackupsRoute,
	siteBackupsIndexRoute,
	siteBackupRestoreRoute,
	siteDomainsRoute,
	siteEmailsRoute,
	siteSettingsRoute,
	siteSettingsSiteVisibilityRoute,
	siteSettingsSubscriptionGiftingRoute,
	siteSettingsDatabaseRoute,
	siteSettingsWordPressRoute,
	siteSettingsPHPRoute,
	siteSettingsAgencyRoute,
	siteSettingsHundredYearPlanRoute,
	siteSettingsPrimaryDataCenterRoute,
	siteSettingsStaticFile404Route,
	siteSettingsCachingRoute,
	siteSettingsDefensiveModeRoute,
	siteSettingsTransferSiteRoute,
	siteSettingsSftpSshRoute,
	siteSettingsWebApplicationFirewallRoute,
	siteTrialEndedRoute,
	siteDifmLiteInProgressRoute,
} from './sites';
import type { AppConfig } from '../context';
import type { AnyRoute } from '@tanstack/react-router';

interface RouteContext {
	config?: AppConfig;
}

const indexRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: '/',
	beforeLoad: ( { context }: { context: RouteContext } ) => {
		if ( context.config ) {
			throw redirect( { to: context.config.mainRoute } );
		}
	},
} );

const overviewRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: 'overview',
} ).lazy( () =>
	import( '../../agency-overview' ).then( ( d ) =>
		createLazyRoute( 'agency-overview' )( {
			component: d.default,
		} )
	)
);

const emailsRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: 'emails',
	loader: () => queryClient.ensureQueryData( emailsQuery() ),
} ).lazy( () =>
	import( '../../emails' ).then( ( d ) =>
		createLazyRoute( 'emails' )( {
			component: d.default,
		} )
	)
);

const createRouteTree = ( config: AppConfig ) => {
	const children = [];

	children.push( indexRoute );

	if ( config.supports.overview ) {
		children.push( overviewRoute );
	}

	if ( config.supports.sites ) {
		const siteChildren: AnyRoute[] = [
			siteOverviewRoute,
			siteSettingsRoute,
			siteSettingsSiteVisibilityRoute,
			siteSettingsSubscriptionGiftingRoute,
			siteSettingsDatabaseRoute,
			siteSettingsWordPressRoute,
			siteSettingsPHPRoute,
			siteSettingsAgencyRoute,
			siteSettingsHundredYearPlanRoute,
			siteSettingsPrimaryDataCenterRoute,
			siteSettingsStaticFile404Route,
			siteSettingsCachingRoute,
			siteSettingsDefensiveModeRoute,
			siteSettingsTransferSiteRoute,
			siteSettingsSftpSshRoute,
			siteSettingsWebApplicationFirewallRoute,
			siteTrialEndedRoute,
			siteDifmLiteInProgressRoute,
		];

		if ( config.supports.sites.deployments ) {
			siteChildren.push( siteDeploymentsRoute );
		}

		if ( config.supports.sites.performance ) {
			siteChildren.push( sitePerformanceRoute );
		}

		if ( config.supports.sites.monitoring ) {
			siteChildren.push( siteMonitoringRoute );
		}

		if ( config.supports.sites.logs ) {
			siteChildren.push(
				siteLogsRoute.addChildren( [ siteLogsIndexRoute, siteLogsPhpRoute, siteLogsServerRoute ] )
			);
		}

		if ( config.supports.sites.backups ) {
			siteChildren.push(
				siteBackupsRoute.addChildren( [ siteBackupsIndexRoute, siteBackupRestoreRoute ] )
			);
		}

		if ( config.supports.sites.domains ) {
			siteChildren.push( siteDomainsRoute );
		}

		if ( config.supports.sites.emails ) {
			siteChildren.push( siteEmailsRoute );
		}

		children.push( sitesRoute, siteRoute.addChildren( siteChildren ) );
	}

	if ( config.supports.domains ) {
		children.push( domainsRoute );
		children.push( domainRoute.addChildren( domainChildRoutes ) );
	}

	if ( config.supports.emails ) {
		children.push( emailsRoute );
	}

	if ( config.supports.me ) {
		children.push( meRoute.addChildren( meChildRoutes ) );
	}

	return rootRoute.addChildren( children );
};

export const getRouter = ( config: AppConfig ) => {
	const routeTree = createRouteTree( config );
	return new Router( {
		routeTree,
		basepath: config.basePath,
		defaultErrorComponent: UnknownError,
		defaultNotFoundComponent: NotFound,
		defaultPreload: 'intent',
		defaultPreloadStaleTime: 0,
		// Calling document.startViewTransition() ourselves is really tricky,
		// Tanstack Router knows how to do it best. Even though it says
		// "default", we can still customize it in CSS and add more transition
		// areas.
		defaultViewTransition: true,
	} );
};

export {
	rootRoute,
	indexRoute,
	overviewRoute,
	sitesRoute,
	siteRoute,
	siteOverviewRoute,
	siteDeploymentsRoute,
	sitePerformanceRoute,
	siteMonitoringRoute,
	siteLogsRoute,
	siteBackupsRoute,
	siteDomainsRoute,
	siteEmailsRoute,
	siteSettingsRoute,
	siteSettingsSiteVisibilityRoute,
	siteSettingsSubscriptionGiftingRoute,
	siteSettingsDatabaseRoute,
	siteSettingsWordPressRoute,
	siteSettingsPHPRoute,
	siteSettingsAgencyRoute,
	siteSettingsHundredYearPlanRoute,
	siteSettingsPrimaryDataCenterRoute,
	siteSettingsStaticFile404Route,
	siteSettingsCachingRoute,
	siteSettingsDefensiveModeRoute,
	siteSettingsTransferSiteRoute,
	siteSettingsSftpSshRoute,
	siteSettingsWebApplicationFirewallRoute,
	domainsRoute,
	domainRoute,
	emailsRoute,
};
