import { HostingFeatures, DotcomFeatures, LogType } from '@automattic/api-core';
import {
	isAutomatticianQuery,
	rawUserPreferencesQuery,
	siteLastFiveActivityLogEntriesQuery,
	siteRewindableActivityLogEntriesQuery,
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
	sitePurchaseQuery,
	sitePurchasesQuery,
	siteScanQuery,
	siteSettingsQuery,
	siteSftpUsersQuery,
	sitesQuery,
	siteSshAccessStatusQuery,
	siteStaticFile404SettingQuery,
	siteWordPressVersionQuery,
	queryClient,
} from '@automattic/api-queries';
import { isSupportSession } from '@automattic/calypso-support-session';
import { createRoute, redirect, createLazyRoute, lazyRouteComponent } from '@tanstack/react-router';
import { canViewHundredYearPlanSettings, canViewWordPressSettings } from '../../sites/features';
import { hasHostingFeature, hasPlanFeature } from '../../utils/site-features';
import { isSiteMigrationInProgress } from '../../utils/site-status';
import { hasSiteTrialEnded } from '../../utils/site-trial';
import { rootRoute } from './root';
import type { AppConfig } from '../context';
import type { AnyRoute } from '@tanstack/react-router';

export const sitesRoute = createRoute( {
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
	import( '../../sites' ).then( ( d ) =>
		createLazyRoute( 'sites' )( {
			component: d.default,
		} )
	)
);

export const siteRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: 'sites/$siteSlug',
	beforeLoad: async ( { cause, params: { siteSlug }, location, matches } ) => {
		if ( cause !== 'enter' ) {
			return;
		}

		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );

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

		const migrationUrl = `/sites/${ siteSlug }/site-migration-in-progress`;
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
					queryClient.ensureQueryData( sitePurchaseQuery( site.ID, parseInt( currentPlan.id ) ) );
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
	getParentRoute: () => siteRoute,
	path: 'deployments',
} ).lazy( () =>
	import( '../../sites/deployment-list' ).then( ( d ) =>
		createLazyRoute( 'site-deployments' )( {
			component: d.default,
		} )
	)
);

export const siteMonitoringRoute = createRoute( {
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
	getParentRoute: () => siteRoute,
	path: 'logs',
} );

export const siteLogsIndexRoute = createRoute( {
	getParentRoute: () => siteLogsRoute,
	path: '/',
	beforeLoad: ( { params } ) => {
		throw redirect( { to: `/sites/${ params.siteSlug }/logs/php` } );
	},
} );

export const siteLogsPhpRoute = createRoute( {
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

export const siteBackupsRoute = createRoute( {
	getParentRoute: () => siteRoute,
	path: 'backups',
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
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		// Preload activity log backup-related entries.
		if ( hasHostingFeature( site, HostingFeatures.BACKUPS ) ) {
			queryClient.ensureQueryData( siteRewindableActivityLogEntriesQuery( site.ID ) );
		}
	},
} ).lazy( () =>
	import( '../../sites/backups' ).then( ( d ) =>
		createLazyRoute( 'site-backups-index' )( {
			component: d.BackupsListPage,
		} )
	)
);

export const siteBackupRestoreRoute = createRoute( {
	getParentRoute: () => siteBackupsRoute,
	path: '$rewindId/restore',
} ).lazy( () =>
	import( '../../sites/backup-restore' ).then( ( d ) =>
		createLazyRoute( 'site-backup-restore' )( {
			component: d.default,
		} )
	)
);

export const siteBackupDownloadRoute = createRoute( {
	getParentRoute: () => siteBackupsRoute,
	path: '$rewindId/download',
} ).lazy( () =>
	import( '../../sites/backup-download' ).then( ( d ) =>
		createLazyRoute( 'site-backup-download' )( {
			component: d.default,
		} )
	)
);

export const siteDomainsRoute = createRoute( {
	getParentRoute: () => siteRoute,
	path: 'domains',
} ).lazy( () =>
	import( '../../sites/domains' ).then( ( d ) =>
		createLazyRoute( 'site-domains' )( {
			component: d.default,
		} )
	)
);

export const siteEmailsRoute = createRoute( {
	getParentRoute: () => siteRoute,
	path: 'emails',
} ).lazy( () =>
	import( '../../sites/emails' ).then( ( d ) =>
		createLazyRoute( 'site-emails' )( {
			component: d.default,
		} )
	)
);

export const sitePerformanceRoute = createRoute( {
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
	getParentRoute: () => siteRoute,
	path: 'settings',
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		queryClient.ensureQueryData( siteSettingsQuery( site.ID ) );
	},
} ).lazy( () =>
	import( '../../sites/settings' ).then( ( d ) =>
		createLazyRoute( 'site-settings' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

export const siteSettingsSiteVisibilityRoute = createRoute( {
	getParentRoute: () => siteRoute,
	path: 'settings/site-visibility',
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

export const siteSettingsSubscriptionGiftingRoute = createRoute( {
	getParentRoute: () => siteRoute,
	path: 'settings/subscription-gifting',
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
	getParentRoute: () => siteRoute,
	path: 'settings/wordpress',
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
	getParentRoute: () => siteRoute,
	path: 'settings/php',
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
	getParentRoute: () => siteRoute,
	path: 'settings/database',
} ).lazy( () =>
	import( '../../sites/settings-database' ).then( ( d ) =>
		createLazyRoute( 'site-settings-database' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

export const siteSettingsAgencyRoute = createRoute( {
	getParentRoute: () => siteRoute,
	path: 'settings/agency',
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

export const siteSettingsMcpRoute = createRoute( {
	getParentRoute: () => siteRoute,
	path: 'settings/mcp',
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		await queryClient.ensureQueryData( siteSettingsQuery( site.ID ) );
	},
} ).lazy( () =>
	import( '../../sites/settings-mcp' ).then( ( d ) => {
		return createLazyRoute( 'site-settings-mcp' )( {
			component: () => {
				return <d.default siteSlug={ siteRoute.useParams().siteSlug } />;
			},
		} );
	} )
);

export const siteSettingsMcpSetupRoute = createRoute( {
	getParentRoute: () => siteRoute,
	path: 'settings/mcp-setup',
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		await queryClient.ensureQueryData( siteSettingsQuery( site.ID ) );
	},
} ).lazy( () =>
	import( '../../sites/settings-mcp/setup' ).then( ( d ) => {
		return createLazyRoute( 'site-settings-mcp-setup' )( {
			component: () => {
				return <d.default siteSlug={ siteRoute.useParams().siteSlug } />;
			},
		} );
	} )
);

export const siteSettingsHundredYearPlanRoute = createRoute( {
	getParentRoute: () => siteRoute,
	path: 'settings/hundred-year-plan',
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
	getParentRoute: () => siteRoute,
	path: 'settings/primary-data-center',
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
	getParentRoute: () => siteRoute,
	path: 'settings/static-file-404',
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
	getParentRoute: () => siteRoute,
	path: 'settings/caching',
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
	getParentRoute: () => siteRoute,
	path: 'settings/defensive-mode',
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
	getParentRoute: () => siteRoute,
	path: 'settings/sftp-ssh',
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
	getParentRoute: () => siteRoute,
	path: 'settings/transfer-site',
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
	getParentRoute: () => siteRoute,
	path: 'settings/web-application-firewall',
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
	getParentRoute: () => siteRoute,
	path: 'settings/wpcom-login',
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
	getParentRoute: () => siteRoute,
	path: 'settings/repositories',
} ).lazy( () =>
	import( '../../sites/settings-repositories' ).then( ( d ) =>
		createLazyRoute( 'site-settings-repositories' )( {
			component: d.default,
		} )
	)
);

export const siteTrialEndedRoute = createRoute( {
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
	},
} ).lazy( () =>
	import( '../../sites/difm-lite-in-progress' ).then( ( d ) =>
		createLazyRoute( 'site-difm-lite-in-progress' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

export const siteMigrationInProgressRoute = createRoute( {
	getParentRoute: () => siteRoute,
	path: 'site-migration-in-progress',
	beforeLoad: async ( { cause, params: { siteSlug } } ) => {
		if ( cause !== 'enter' ) {
			return;
		}

		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		if ( ! isSiteMigrationInProgress( site ) ) {
			throw redirect( { to: `/sites/${ siteSlug }` } );
		}
	},
} ).lazy( () =>
	import( '../../sites/migration-in-progress' ).then( ( d ) =>
		createLazyRoute( 'site-migration-in-progress' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

export const siteLogsChildRoutes: AnyRoute[] = [
	siteLogsIndexRoute,
	siteLogsPhpRoute,
	siteLogsServerRoute,
];

export const createSitesRoutes = ( config: AppConfig ) => {
	if ( ! config.supports.sites ) {
		return [];
	}

	const siteRoutes: AnyRoute[] = [
		siteOverviewRoute,
		siteSettingsRoute,
		siteSettingsSiteVisibilityRoute,
		siteSettingsSubscriptionGiftingRoute,
		siteSettingsDatabaseRoute,
		siteSettingsWordPressRoute,
		siteSettingsPHPRoute,
		siteSettingsAgencyRoute,
		siteSettingsMcpRoute,
		siteSettingsMcpSetupRoute,
		siteSettingsRepositoriesRoute,
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
		siteMigrationInProgressRoute,
	];

	if ( config.supports.sites.deployments ) {
		siteRoutes.push( siteDeploymentsRoute );
	}

	if ( config.supports.sites.performance ) {
		siteRoutes.push( sitePerformanceRoute );
	}

	if ( config.supports.sites.monitoring ) {
		siteRoutes.push( siteMonitoringRoute );
	}

	if ( config.supports.sites.logs ) {
		siteRoutes.push(
			siteLogsRoute.addChildren( [ siteLogsIndexRoute, siteLogsPhpRoute, siteLogsServerRoute ] )
		);
	}

	if ( config.supports.sites.backups ) {
		siteRoutes.push(
			siteBackupsRoute.addChildren( [
				siteBackupsIndexRoute,
				siteBackupRestoreRoute,
				siteBackupDownloadRoute,
			] )
		);
	}

	if ( config.supports.sites.domains ) {
		siteRoutes.push( siteDomainsRoute );
	}

	if ( config.supports.sites.emails ) {
		siteRoutes.push( siteEmailsRoute );
	}

	return [ sitesRoute, siteRoute.addChildren( siteRoutes ) ];
};

// Site routes which are still allowed to be accessed while a site gets the DIFM lite process.
// Defined as a `function` so that routes defined earlier can reference routes defined later.
function getDifmLiteAllowedRoutes() {
	return [ siteDifmLiteInProgressRoute.id, siteDomainsRoute.id, siteEmailsRoute.id ];
}
