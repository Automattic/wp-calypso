import { HostingFeatures, DotcomFeatures, LogType } from '@automattic/api-core';
import {
	codeDeploymentQuery,
	codeDeploymentsQuery,
	githubInstallationsQuery,
	isAutomatticianQuery,
	productsQuery,
	rawUserPreferencesQuery,
	siteLastFiveActivityLogEntriesQuery,
	siteBackupActivityLogEntriesQuery,
	siteAgencyBlogQuery,
	siteLastBackupQuery,
	siteEdgeCacheStatusQuery,
	siteDefensiveModeSettingsQuery,
	siteDifmWebsiteContentQuery,
	siteDomainsQuery,
	siteJetpackModulesQuery,
	siteJetpackSettingsQuery,
	siteMediaStorageQuery,
	sitePHPVersionQuery,
	siteCurrentPlanQuery,
	siteBySlugQuery,
	siteByIdQuery,
	sitePreviewLinksQuery,
	sitePrimaryDataCenterQuery,
	purchaseQuery,
	sitePurchasesQuery,
	siteRedirectQuery,
	siteScanQuery,
	siteSettingsQuery,
	siteSftpUsersQuery,
	siteSshAccessStatusQuery,
	siteStaticFile404SettingQuery,
	siteWordPressVersionQuery,
	queryClient,
} from '@automattic/api-queries';
import { isSupportSession } from '@automattic/calypso-support-session';
import { createRoute, redirect, createLazyRoute, lazyRouteComponent } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import {
	canViewHundredYearPlanSettings,
	canViewSiteVisibilitySettings,
	canViewWordPressSettings,
} from '../../sites/features';
import { hasHostingFeature, hasPlanFeature } from '../../utils/site-features';
import { getSiteDisplayName } from '../../utils/site-name';
import { isSiteMigrationInProgress, getSiteMigrationState } from '../../utils/site-status';
import { hasSiteTrialEnded } from '../../utils/site-trial';
import { isSelfHostedJetpackConnected } from '../../utils/site-types';
import { rootRoute } from './root';
import type { AppConfig } from '../context';
import type { DifmWebsiteContentResponse, Site } from '@automattic/api-core';
import type { AnyRoute } from '@tanstack/react-router';

export const sitesRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Sites' ),
			},
		],
	} ),
	getParentRoute: () => rootRoute,
	path: 'sites',
	loader: async ( { context } ) => {
		// Preload the default sites list response without blocking.
		queryClient.ensureQueryData( context.config.queries.sitesQuery() );

		await Promise.all( [
			queryClient.ensureQueryData( isAutomatticianQuery() ),
			queryClient.ensureQueryData( rawUserPreferencesQuery() ),
		] );
	},
} );

export const siteRoute = createRoute( {
	head: ( { loaderData }: { loaderData?: { site: Site } } ) => ( {
		meta: [
			{
				title: loaderData && getSiteDisplayName( loaderData.site ),
			},
		],
	} ),
	getParentRoute: () => rootRoute,
	path: 'sites/$siteSlug',
	beforeLoad: async ( { cause, params: { siteSlug }, location, matches } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );

		const overviewUrl = `/sites/${ siteSlug }`;
		if ( isSelfHostedJetpackConnected( site ) && ! location.pathname.endsWith( overviewUrl ) ) {
			throw redirect( { to: overviewUrl } );
		}

		if ( cause !== 'enter' ) {
			return;
		}

		const trialExpiredUrl = `/sites/${ siteSlug }/trial-ended`;
		if ( hasSiteTrialEnded( site ) && ! location.pathname.includes( trialExpiredUrl ) ) {
			throw redirect( { to: trialExpiredUrl } );
		}

		const difmUrl = `/sites/${ siteSlug }/site-building-in-progress`;
		const difmAllowedRoutes = getDifmLiteAllowedRoutes();
		if (
			site.options?.is_difm_lite_in_progress &&
			! isSupportSession() &&
			! matches.some( ( match ) => difmAllowedRoutes.includes( match.routeId ) )
		) {
			throw redirect( { to: difmUrl } );
		}

		const migrationUrl = `/sites/${ siteSlug }/migration-overview`;
		if ( isSiteMigrationInProgress( site ) && ! location.pathname.includes( migrationUrl ) ) {
			throw redirect( { to: migrationUrl } );
		}
	},
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		const otherEnvironmentSiteId = site.is_wpcom_staging_site
			? site.options?.wpcom_production_blog_id
			: site.options?.wpcom_staging_blog_ids?.[ 0 ];
		if ( otherEnvironmentSiteId ) {
			await queryClient.ensureQueryData( siteByIdQuery( otherEnvironmentSiteId ) );
		}

		return { site };
	},
	errorComponent: lazyRouteComponent( () => import( '../../sites/site/error' ) ),
} ).lazy( () =>
	import( '../../sites/site' ).then( ( d ) =>
		createLazyRoute( 'site' )( {
			component: d.default,
		} )
	)
);

export const siteOverviewRoute = createRoute( {
	getParentRoute: () => siteRoute,
	path: '/',
	loader: async ( { params: { siteSlug }, preload } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		if ( preload ) {
			Promise.all( [
				queryClient.ensureQueryData( siteCurrentPlanQuery( site.ID ) ),
				queryClient.ensureQueryData( siteLastFiveActivityLogEntriesQuery( site.ID ) ),
				hasHostingFeature( site, HostingFeatures.SCAN ) &&
					queryClient.ensureQueryData( siteScanQuery( site.ID ) ),
				hasHostingFeature( site, HostingFeatures.BACKUPS ) &&
					queryClient.ensureQueryData( siteLastBackupQuery( site.ID ) ),
				site.is_a4a_dev_site && queryClient.ensureQueryData( sitePreviewLinksQuery( site.ID ) ),
			] ).then( ( [ currentPlan ] ) => {
				if ( currentPlan.id ) {
					queryClient.ensureQueryData( purchaseQuery( currentPlan.id ) );
				}
			} );
		}
		// Ensure storage specifically is loaded because the warning notice can cause a layout shift
		await Promise.all( [
			queryClient.ensureQueryData( siteMediaStorageQuery( site.ID ) ),
			queryClient.ensureQueryData( rawUserPreferencesQuery() ),
		] );
	},
} ).lazy( () =>
	import( '../../sites/overview' ).then( ( d ) =>
		createLazyRoute( 'site-overview' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

export const siteDeploymentsRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Deployments' ),
			},
		],
	} ),
	getParentRoute: () => siteRoute,
	path: 'deployments',
} ).lazy( () =>
	import( '../../sites/deployments' ).then( ( d ) =>
		createLazyRoute( 'site-deployments' )( {
			component: d.default,
		} )
	)
);

export const siteDeploymentsListRoute = createRoute( {
	getParentRoute: () => siteDeploymentsRoute,
	path: '/',
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		queryClient.ensureQueryData( codeDeploymentsQuery( site.ID ) );
	},
} ).lazy( () =>
	import( '../../sites/deployments-list' ).then( ( d ) =>
		createLazyRoute( 'site-deployments-list' )( {
			component: d.default,
		} )
	)
);

export const siteMonitoringRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Monitoring' ),
			},
		],
	} ),
	getParentRoute: () => siteRoute,
	path: 'monitoring',
} ).lazy( () =>
	import( '../../sites/monitoring' ).then( ( d ) =>
		createLazyRoute( 'site-monitoring' )( {
			component: d.default,
		} )
	)
);

export const siteLogsRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Logs' ),
			},
		],
	} ),
	getParentRoute: () => siteRoute,
	path: 'logs',
} );

export const siteLogsIndexRoute = createRoute( {
	getParentRoute: () => siteLogsRoute,
	path: '/',
	beforeLoad: ( { params } ) => {
		throw redirect( { to: `/sites/${ params.siteSlug }/logs/${ LogType.ACTIVITY }` } );
	},
} );

export const siteLogsPhpRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'PHP errors' ),
			},
		],
	} ),
	getParentRoute: () => siteLogsRoute,
	path: 'php',
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		await queryClient.ensureQueryData( siteSettingsQuery( site.ID ) );
	},
} ).lazy( () =>
	import( '../../sites/logs' ).then( ( d ) =>
		createLazyRoute( 'site-logs-php' )( {
			component: () => <d.default logType={ LogType.PHP } />,
		} )
	)
);

export const siteLogsServerRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Web server' ),
			},
		],
	} ),
	getParentRoute: () => siteLogsRoute,
	path: 'server',
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		await queryClient.ensureQueryData( siteSettingsQuery( site.ID ) );
	},
} ).lazy( () =>
	import( '../../sites/logs' ).then( ( d ) =>
		createLazyRoute( 'site-logs-server' )( {
			component: () => <d.default logType={ LogType.SERVER } />,
		} )
	)
);

export const siteLogsActivityRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Activity' ),
			},
		],
	} ),
	getParentRoute: () => siteLogsRoute,
	path: 'activity',
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		await queryClient.ensureQueryData( siteSettingsQuery( site.ID ) );
	},
} ).lazy( () =>
	import( '../../sites/logs' ).then( ( d ) =>
		createLazyRoute( 'site-logs-activity' )( {
			component: () => <d.default logType={ LogType.ACTIVITY } />,
		} )
	)
);

export const siteScanRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Scan' ),
			},
		],
	} ),
	getParentRoute: () => siteRoute,
	path: 'scan',
} );

export const siteScanIndexRoute = createRoute( {
	getParentRoute: () => siteScanRoute,
	path: '/',
	beforeLoad: ( { params } ) => {
		throw redirect( { to: `/sites/${ params.siteSlug }/scan/active` } );
	},
} );

export const siteScanActiveThreatsRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Active threats' ),
			},
		],
	} ),
	getParentRoute: () => siteScanRoute,
	path: 'active',
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		if ( hasHostingFeature( site, HostingFeatures.SCAN ) ) {
			await queryClient.ensureQueryData( siteScanQuery( site.ID ) );
		}
	},
} ).lazy( () =>
	import( '../../sites/scan' ).then( ( d ) =>
		createLazyRoute( 'site-scan-active-threats' )( {
			component: () => <d.default scanTab="active" />,
		} )
	)
);

export const siteScanHistoryRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'History' ),
			},
		],
	} ),
	getParentRoute: () => siteScanRoute,
	path: 'history',
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		if ( hasHostingFeature( site, HostingFeatures.SCAN ) ) {
			await queryClient.ensureQueryData( siteScanQuery( site.ID ) );
		}
	},
} ).lazy( () =>
	import( '../../sites/scan' ).then( ( d ) =>
		createLazyRoute( 'site-scan-history' )( {
			component: () => <d.default scanTab="history" />,
		} )
	)
);

export const siteBackupsRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Backups' ),
			},
		],
	} ),
	getParentRoute: () => siteRoute,
	path: 'backups',
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		// Preload activity log backup-related entries.
		if ( hasHostingFeature( site, HostingFeatures.BACKUPS ) ) {
			queryClient.ensureQueryData( siteBackupActivityLogEntriesQuery( site.ID ) );
		}
	},
} ).lazy( () =>
	import( '../../sites/backups' ).then( ( d ) =>
		createLazyRoute( 'site-backups' )( {
			component: d.default,
		} )
	)
);

export const siteBackupsIndexRoute = createRoute( {
	getParentRoute: () => siteBackupsRoute,
	path: '/',
} ).lazy( () =>
	import( '../../sites/backups' ).then( ( d ) =>
		createLazyRoute( 'site-backups-index' )( {
			component: d.BackupsListPage,
		} )
	)
);

export const siteBackupDetailRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Backups' ),
			},
		],
	} ),
	getParentRoute: () => siteBackupsRoute,
	path: '$rewindId',
} );

export const siteBackupDetailIndexRoute = createRoute( {
	getParentRoute: () => siteBackupDetailRoute,
	path: '/',
} ).lazy( () =>
	import( '../../sites/backups' ).then( ( d ) =>
		createLazyRoute( 'site-backup-detail' )( {
			component: d.BackupsListPage,
		} )
	)
);

export const siteBackupRestoreRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Site restore' ),
			},
		],
	} ),
	getParentRoute: () => siteBackupDetailRoute,
	path: 'restore',
} ).lazy( () =>
	import( '../../sites/backup-restore' ).then( ( d ) =>
		createLazyRoute( 'site-backup-restore' )( {
			component: d.default,
		} )
	)
);

export const siteBackupDownloadRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Download backup' ),
			},
		],
	} ),
	getParentRoute: () => siteBackupDetailRoute,
	path: 'download',
	validateSearch: ( search ) => {
		const downloadId = Number( search.downloadId );
		return {
			downloadId: downloadId > 0 ? downloadId : undefined,
		};
	},
} ).lazy( () =>
	import( '../../sites/backup-download' ).then( ( d ) =>
		createLazyRoute( 'site-backup-download' )( {
			component: d.default,
		} )
	)
);

export const siteDomainsRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Domains' ),
			},
		],
	} ),
	getParentRoute: () => siteRoute,
	path: 'domains',
} ).lazy( () =>
	import( '../../sites/domains' ).then( ( d ) =>
		createLazyRoute( 'site-domains' )( {
			component: d.default,
		} )
	)
);

export const sitePerformanceRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Performance' ),
			},
		],
	} ),
	getParentRoute: () => siteRoute,
	path: 'performance',
} ).lazy( () =>
	import( '../../sites/performance' ).then( ( d ) =>
		createLazyRoute( 'site-performance' )( {
			component: d.default,
		} )
	)
);

export const siteSettingsRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Settings' ),
			},
		],
	} ),
	getParentRoute: () => siteRoute,
	path: 'settings',
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		queryClient.ensureQueryData( siteSettingsQuery( site.ID ) );

		if ( hasHostingFeature( site, HostingFeatures.PRIMARY_DATA_CENTER ) ) {
			// This impacts layout so we must wait for this to load
			await queryClient.ensureQueryData( sitePrimaryDataCenterQuery( site.ID ) );
		}
	},
} );

export const siteSettingsIndexRoute = createRoute( {
	getParentRoute: () => siteSettingsRoute,
	path: '/',
} ).lazy( () =>
	import( '../../sites/settings' ).then( ( d ) =>
		createLazyRoute( 'site-settings' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

export const siteSettingsSiteVisibilityRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Site visibility' ),
			},
		],
	} ),
	getParentRoute: () => siteSettingsRoute,
	path: 'site-visibility',
	beforeLoad: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		if ( ! canViewSiteVisibilitySettings( site ) ) {
			throw redirect( { to: `/sites/${ siteSlug }/settings` } );
		}
	},
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );

		await Promise.all( [
			queryClient.ensureQueryData( siteSettingsQuery( site.ID ) ),
			queryClient.ensureQueryData( siteDomainsQuery( site.ID ) ),
			site.is_coming_soon &&
				hasPlanFeature( site, DotcomFeatures.SITE_PREVIEW_LINKS ) &&
				queryClient.ensureQueryData( sitePreviewLinksQuery( site.ID ) ),
		] );
	},
} ).lazy( () =>
	import( '../../sites/settings-site-visibility' ).then( ( d ) =>
		createLazyRoute( 'site-settings-site-visibility' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

export const siteSettingsRedirectRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Site Redirect' ),
			},
		],
	} ),
	getParentRoute: () => siteSettingsRoute,
	path: 'site-redirect',
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		return await Promise.all( [
			queryClient.ensureQueryData( productsQuery() ),
			queryClient.ensureQueryData( siteRedirectQuery( site.ID ) ),
		] );
	},
} ).lazy( () =>
	import( '../../sites/settings-redirect' ).then( ( d ) =>
		createLazyRoute( 'site-settings-redirect' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

export const siteSettingsSubscriptionGiftingRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Accept a gift subscription' ),
			},
		],
	} ),
	getParentRoute: () => siteSettingsRoute,
	path: 'subscription-gifting',
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		queryClient.ensureQueryData( siteSettingsQuery( site.ID ) );
	},
} ).lazy( () =>
	import( '../../sites/settings-subscription-gifting' ).then( ( d ) =>
		createLazyRoute( 'site-settings-subscription-gifting' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

export const siteSettingsWordPressRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: 'WordPress',
			},
		],
	} ),
	getParentRoute: () => siteSettingsRoute,
	path: 'wordpress',
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		if ( canViewWordPressSettings( site ) ) {
			await queryClient.ensureQueryData( siteWordPressVersionQuery( site.ID ) );
		}
	},
} ).lazy( () =>
	import( '../../sites/settings-wordpress' ).then( ( d ) =>
		createLazyRoute( 'site-settings-wordpress' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

export const siteSettingsPHPRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: 'PHP',
			},
		],
	} ),
	getParentRoute: () => siteSettingsRoute,
	path: 'php',
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		if ( hasHostingFeature( site, HostingFeatures.PHP ) ) {
			await queryClient.ensureQueryData( sitePHPVersionQuery( site.ID ) );
		}
	},
} ).lazy( () =>
	import( '../../sites/settings-php' ).then( ( d ) =>
		createLazyRoute( 'site-settings-php' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

export const siteSettingsDatabaseRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Database' ),
			},
		],
	} ),
	getParentRoute: () => siteSettingsRoute,
	path: 'database',
} ).lazy( () =>
	import( '../../sites/settings-database' ).then( ( d ) =>
		createLazyRoute( 'site-settings-database' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

export const siteSettingsAgencyRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Agency settings' ),
			},
		],
	} ),
	getParentRoute: () => siteSettingsRoute,
	path: 'agency',
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		if ( site.is_wpcom_atomic ) {
			await queryClient.ensureQueryData( siteAgencyBlogQuery( site.ID ) );
		}
	},
} ).lazy( () =>
	import( '../../sites/settings-agency' ).then( ( d ) =>
		createLazyRoute( 'site-settings-agency' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

export const siteSettingsHundredYearPlanRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Control your legacy' ),
			},
		],
	} ),
	getParentRoute: () => siteSettingsRoute,
	path: 'hundred-year-plan',
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		if ( canViewHundredYearPlanSettings( site ) ) {
			await queryClient.ensureQueryData( siteSettingsQuery( site.ID ) );
		}
	},
} ).lazy( () =>
	import( '../../sites/settings-hundred-year-plan' ).then( ( d ) =>
		createLazyRoute( 'site-settings-hundred-year-plan' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

export const siteSettingsPrimaryDataCenterRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Primary data center' ),
			},
		],
	} ),
	getParentRoute: () => siteSettingsRoute,
	path: 'primary-data-center',
	beforeLoad: async ( { cause, params: { siteSlug } } ) => {
		if ( cause !== 'enter' ) {
			return;
		}

		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		if ( hasHostingFeature( site, HostingFeatures.PRIMARY_DATA_CENTER ) ) {
			const primaryDataCenter = await queryClient.ensureQueryData(
				sitePrimaryDataCenterQuery( site.ID )
			);
			if ( primaryDataCenter ) {
				return;
			}
		}

		throw redirect( { to: `/sites/${ siteSlug }/settings` } );
	},
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		if ( hasHostingFeature( site, HostingFeatures.PRIMARY_DATA_CENTER ) ) {
			await queryClient.ensureQueryData( sitePrimaryDataCenterQuery( site.ID ) );
		}
	},
} ).lazy( () =>
	import( '../../sites/settings-primary-data-center' ).then( ( d ) =>
		createLazyRoute( 'site-settings-primary-data-center' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

export const siteSettingsStaticFile404Route = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Handling requests for nonexistent assets' ),
			},
		],
	} ),
	getParentRoute: () => siteSettingsRoute,
	path: 'static-file-404',
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		if ( hasHostingFeature( site, HostingFeatures.STATIC_FILE_404 ) ) {
			await queryClient.ensureQueryData( siteStaticFile404SettingQuery( site.ID ) );
		}
	},
} ).lazy( () =>
	import( '../../sites/settings-static-file-404' ).then( ( d ) =>
		createLazyRoute( 'site-settings-static-file-404' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

export const siteSettingsCachingRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Caching' ),
			},
		],
	} ),
	getParentRoute: () => siteSettingsRoute,
	path: 'caching',
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		if ( hasHostingFeature( site, HostingFeatures.CACHING ) ) {
			await queryClient.ensureQueryData( siteEdgeCacheStatusQuery( site.ID ) );
		}
	},
} ).lazy( () =>
	import( '../../sites/settings-caching' ).then( ( d ) =>
		createLazyRoute( 'site-settings-caching' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

export const siteSettingsDefensiveModeRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Defensive mode' ),
			},
		],
	} ),
	getParentRoute: () => siteSettingsRoute,
	path: 'defensive-mode',
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		if ( hasHostingFeature( site, HostingFeatures.DEFENSIVE_MODE ) ) {
			await queryClient.ensureQueryData( siteDefensiveModeSettingsQuery( site.ID ) );
		}
	},
} ).lazy( () =>
	import( '../../sites/settings-defensive-mode' ).then( ( d ) =>
		createLazyRoute( 'site-settings-defensive-mode' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

export const siteSettingsSftpSshRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'SFTP/SSH' ),
			},
		],
	} ),
	getParentRoute: () => siteSettingsRoute,
	path: 'sftp-ssh',
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		return Promise.all( [
			hasHostingFeature( site, HostingFeatures.SFTP ) &&
				queryClient.ensureQueryData( siteSftpUsersQuery( site.ID ) ),
			hasHostingFeature( site, HostingFeatures.SSH ) &&
				queryClient.ensureQueryData( siteSshAccessStatusQuery( site.ID ) ),
		] );
	},
} ).lazy( () =>
	import( '../../sites/settings-sftp-ssh' ).then( ( d ) =>
		createLazyRoute( 'site-settings-sftp-ssh' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

export const siteSettingsTransferSiteRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Transfer site' ),
			},
		],
	} ),
	getParentRoute: () => siteSettingsRoute,
	path: 'transfer-site',
} ).lazy( () =>
	import( '../../sites/settings-transfer-site' ).then( ( d ) =>
		createLazyRoute( 'site-settings-transfer-site' )( {
			component: () => (
				<d.default siteSlug={ siteRoute.useParams().siteSlug } context="dashboard_v2" />
			),
		} )
	)
);

export const siteSettingsWebApplicationFirewallRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Web Application Firewall (WAF)' ),
			},
		],
	} ),
	getParentRoute: () => siteSettingsRoute,
	path: 'web-application-firewall',
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		if ( hasHostingFeature( site, HostingFeatures.SECURITY_SETTINGS ) ) {
			await Promise.all( [
				queryClient.ensureQueryData( siteJetpackModulesQuery( site.ID ) ),
				queryClient.ensureQueryData( siteJetpackSettingsQuery( site.ID ) ),
			] );
		}
	},
} ).lazy( () =>
	import( '../../sites/settings-web-application-firewall' ).then( ( d ) =>
		createLazyRoute( 'site-settings-web-application-firewall' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

export const siteSettingsWpcomLoginRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'WordPress.com login' ),
			},
		],
	} ),
	getParentRoute: () => siteSettingsRoute,
	path: 'wpcom-login',
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		if ( hasHostingFeature( site, HostingFeatures.SECURITY_SETTINGS ) ) {
			await Promise.all( [
				queryClient.ensureQueryData( siteJetpackModulesQuery( site.ID ) ),
				queryClient.ensureQueryData( siteJetpackSettingsQuery( site.ID ) ),
			] );
		}
	},
} ).lazy( () =>
	import( '../../sites/settings-wpcom-login' ).then( ( d ) =>
		createLazyRoute( 'site-settings-wpcom-login' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

export const siteSettingsRepositoriesRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Repositories' ),
			},
		],
	} ),
	getParentRoute: () => siteSettingsRoute,
	path: 'repositories',
	validateSearch: ( search ): { back_to?: 'deployments' } => {
		return {
			back_to: search.back_to === 'deployments' ? 'deployments' : undefined,
		};
	},
} );

export const siteSettingsRepositoriesIndexRoute = createRoute( {
	getParentRoute: () => siteSettingsRepositoriesRoute,
	path: '/',
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		queryClient.ensureQueryData( codeDeploymentsQuery( site.ID ) );
		queryClient.ensureQueryData( githubInstallationsQuery() );
	},
} ).lazy( () =>
	import( '../../sites/settings-repositories' ).then( ( d ) =>
		createLazyRoute( 'site-settings-repositories' )( {
			component: d.default,
		} )
	)
);

export const siteSettingsRepositoriesConnectRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Connect repository' ),
			},
		],
	} ),
	getParentRoute: () => siteSettingsRepositoriesRoute,
	path: 'connect',
	loader: () => {
		queryClient.ensureQueryData( githubInstallationsQuery() );
	},
} ).lazy( () =>
	import( '../../sites/settings-repositories/connect-repository' ).then( ( d ) =>
		createLazyRoute( 'site-settings-repositories-connect' )( {
			component: d.default,
		} )
	)
);

export const siteSettingsRepositoriesManageRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Configure repository' ),
			},
		],
	} ),
	getParentRoute: () => siteSettingsRepositoriesRoute,
	path: 'manage/$deploymentId',
	parseParams: ( params ) => ( {
		deploymentId: Number( params.deploymentId ),
	} ),
	validateSearch: ( search ): { back_to?: 'deployments' } => {
		return {
			back_to: search.back_to === 'deployments' ? 'deployments' : undefined,
		};
	},
	loader: async ( { params: { siteSlug, deploymentId } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		await queryClient.ensureQueryData( codeDeploymentQuery( site.ID, deploymentId ) );
	},
} ).lazy( () =>
	import( '../../sites/settings-repositories/configure-repository' ).then( ( d ) =>
		createLazyRoute( 'site-settings-repositories-manage' )( {
			component: d.default,
		} )
	)
);

export const siteTrialEndedRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Your free trial has ended' ),
			},
		],
	} ),
	getParentRoute: () => siteRoute,
	path: 'trial-ended',
	beforeLoad: async ( { cause, params: { siteSlug } } ) => {
		if ( cause !== 'enter' ) {
			return;
		}

		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		if ( ! hasSiteTrialEnded( site ) ) {
			throw redirect( { to: `/sites/${ siteSlug }` } );
		}
	},
} ).lazy( () =>
	import( '../../sites/trial-ended' ).then( ( d ) =>
		createLazyRoute( 'site-trial-ended' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

export const siteDifmLiteInProgressRoute = createRoute( {
	head: ( { loaderData }: { loaderData?: { websiteContent: DifmWebsiteContentResponse } } ) => ( {
		meta: [
			{
				title: loaderData?.websiteContent?.is_website_content_submitted
					? __( 'Your content submission was successful!' )
					: __( 'Website content not submitted' ),
			},
		],
	} ),
	getParentRoute: () => siteRoute,
	path: 'site-building-in-progress',
	beforeLoad: async ( { cause, params: { siteSlug } } ) => {
		if ( cause !== 'enter' ) {
			return;
		}

		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		if ( ! site.options?.is_difm_lite_in_progress ) {
			throw redirect( { to: `/sites/${ siteSlug }` } );
		}
	},
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		const [ websiteContent ] = await Promise.all( [
			queryClient.ensureQueryData( siteDifmWebsiteContentQuery( site.ID ) ),
			queryClient.ensureQueryData( siteDomainsQuery( site.ID ) ),
		] );
		if ( ! websiteContent.is_website_content_submitted ) {
			await queryClient.ensureQueryData( sitePurchasesQuery( site.ID ) );
		}

		return {
			websiteContent,
		};
	},
} ).lazy( () =>
	import( '../../sites/difm-lite-in-progress' ).then( ( d ) =>
		createLazyRoute( 'site-difm-lite-in-progress' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

export const siteMigrationOverviewRoute = createRoute( {
	head: ( { loaderData }: { loaderData?: { site: Site } } ) => {
		const migrationState = loaderData && getSiteMigrationState( loaderData.site );
		let title;
		if ( migrationState?.status === 'pending' ) {
			title = __( 'Your WordPress site is ready to be migrated' );
		} else if ( migrationState?.type === 'difm' ) {
			title = __( 'We’ve received your migration request' );
		} else {
			title = __( 'Your migration is underway' );
		}

		return {
			meta: [
				{
					title,
				},
			],
		};
	},
	getParentRoute: () => siteRoute,
	path: 'migration-overview',
	beforeLoad: async ( { cause, params: { siteSlug } } ) => {
		if ( cause !== 'enter' ) {
			return;
		}

		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		if ( ! isSiteMigrationInProgress( site ) ) {
			throw redirect( { to: `/sites/${ siteSlug }` } );
		}

		return {
			site,
		};
	},
} ).lazy( () =>
	import( '../../sites/migration-overview' ).then( ( d ) =>
		createLazyRoute( 'migration-overview' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

export const siteSSHMigrationFailedRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'We hit a snag, but we’re on it' ),
			},
		],
	} ),
	getParentRoute: () => siteRoute,
	path: 'ssh-migration-failed',
} ).lazy( () =>
	import( '../../sites/ssh-migration-failed' ).then( ( d ) =>
		createLazyRoute( 'ssh-migration-failed' )( {
			component: () => <d.default />,
		} )
	)
);

export const siteSSHMigrationCompleteRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Welcome to your new home' ),
			},
		],
	} ),
	getParentRoute: () => siteRoute,
	path: 'ssh-migration-complete',
} ).lazy( () =>
	import( '../../sites/ssh-migration-complete' ).then( ( d ) =>
		createLazyRoute( 'ssh-migration-complete' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

export const createSitesRoutes = ( config: AppConfig ) => {
	if ( ! config.supports.sites ) {
		return [];
	}

	const siteRoutes: AnyRoute[] = [
		siteOverviewRoute,
		siteTrialEndedRoute,
		siteDifmLiteInProgressRoute,
		siteMigrationOverviewRoute,
		siteSSHMigrationCompleteRoute,
		siteSSHMigrationFailedRoute,
	];

	if ( config.supports.sites.deployments ) {
		siteRoutes.push( siteDeploymentsRoute.addChildren( [ siteDeploymentsListRoute ] ) );
	}

	if ( config.supports.sites.performance ) {
		siteRoutes.push( sitePerformanceRoute );
	}

	if ( config.supports.sites.monitoring ) {
		siteRoutes.push( siteMonitoringRoute );
	}

	if ( config.supports.sites.logs ) {
		siteRoutes.push(
			siteLogsRoute.addChildren( [
				siteLogsIndexRoute,
				siteLogsPhpRoute,
				siteLogsServerRoute,
				siteLogsActivityRoute,
			] )
		);
	}

	if ( config.supports.sites.backups ) {
		siteRoutes.push(
			siteBackupsRoute.addChildren( [
				siteBackupsIndexRoute,
				siteBackupDetailRoute.addChildren( [
					siteBackupDetailIndexRoute,
					siteBackupRestoreRoute,
					siteBackupDownloadRoute,
				] ),
			] )
		);
	}

	if ( config.supports.sites.scan ) {
		siteRoutes.push(
			siteScanRoute.addChildren( [
				siteScanIndexRoute,
				siteScanActiveThreatsRoute,
				siteScanHistoryRoute,
			] )
		);
	}

	if ( config.supports.sites.domains ) {
		siteRoutes.push( siteDomainsRoute );
	}

	if ( config.supports.sites.settings ) {
		const settingsRoutes: AnyRoute[] = [ siteSettingsIndexRoute ];

		if ( config.supports.sites.settings.general ) {
			const settingsGeneralRoutes: AnyRoute[] = [
				siteSettingsSiteVisibilityRoute,
				siteSettingsSubscriptionGiftingRoute,
				siteSettingsAgencyRoute,
				siteSettingsHundredYearPlanRoute,
			];

			if ( config.supports.sites.settings.general.redirect ) {
				settingsGeneralRoutes.push( siteSettingsRedirectRoute );
			}

			settingsRoutes.push( ...settingsGeneralRoutes );
		}

		if ( config.supports.sites.settings.server ) {
			settingsRoutes.push(
				...[
					siteSettingsWordPressRoute,
					siteSettingsPHPRoute,
					siteSettingsSftpSshRoute,
					siteSettingsRepositoriesRoute.addChildren( [
						siteSettingsRepositoriesIndexRoute,
						siteSettingsRepositoriesConnectRoute,
						siteSettingsRepositoriesManageRoute,
					] ),
					siteSettingsDatabaseRoute,
					siteSettingsPrimaryDataCenterRoute,
					siteSettingsStaticFile404Route,
					siteSettingsCachingRoute,
				]
			);
		}

		if ( config.supports.sites.settings.security ) {
			settingsRoutes.push(
				...[
					siteSettingsWebApplicationFirewallRoute,
					siteSettingsWpcomLoginRoute,
					siteSettingsDefensiveModeRoute,
				]
			);
		}

		siteRoutes.push( siteSettingsRoute.addChildren( settingsRoutes ) );
	}

	return [
		sitesRoute.lazy( () =>
			config.components.sites().then( ( d ) =>
				createLazyRoute( 'sites' )( {
					component: d.default,
				} )
			)
		),
		siteRoute.addChildren( siteRoutes ),
	];
};

// Site routes which are still allowed to be accessed while a site gets the DIFM lite process.
// Defined as a `function` so that routes defined earlier can reference routes defined later.
function getDifmLiteAllowedRoutes() {
	return [ siteDifmLiteInProgressRoute.id, siteDomainsRoute.id ];
}
