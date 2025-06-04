import {
	fetchSites,
	fetchSite,
	fetchSiteMediaStorage,
	fetchSiteMonitorUptime,
	fetchPHPVersion,
	updatePHPVersion,
	fetchCurrentPlan,
	fetchSiteEngagementStats,
	fetchDomains,
	fetchEmails,
	fetchProfile,
	updateProfile,
	fetchSiteSettings,
	fetchBasicMetrics,
	fetchPerformanceInsights,
	updateSiteSettings,
	restoreSitePlanSoftware,
	siteOwnerTransfer,
	siteOwnerTransferEligibilityCheck,
	siteOwnerTransferConfirm,
	deleteSite,
	fetchWordPressVersion,
	updateWordPressVersion,
	fetchAgencyBlogBySiteId,
	fetchPrimaryDataCenter,
	fetchStaticFile404,
	updateStaticFile404,
	clearObjectCache,
	clearEdgeCache,
	fetchEdgeCacheStatus,
	updateEdgeCacheStatus,
	fetchEdgeCacheDefensiveMode,
	updateEdgeCacheDefensiveMode,
	fetchPurchases,
	fetchSiteUserMe,
	leaveSite,
	fetchP2HubP2s,
	fetchSiteResetContentSummary,
	resetSite,
	fetchSiteResetStatus,
	launchSite,
	fetchSftpUsers,
	createSftpUser,
	resetSftpPassword,
	fetchSshAccessStatus,
	enableSshAccess,
	disableSshAccess,
	fetchSiteSshKeys,
	fetchProfileSshKeys,
	attachSiteSshKey,
	detachSiteSshKey,
} from '../data';
import { SITE_FIELDS, SITE_OPTIONS } from '../data/constants';
import { queryClient } from './query-client';
import type {
	Profile,
	Purchase,
	SiteSettings,
	UrlPerformanceInsights,
	DefensiveModeSettings,
	DefensiveModeSettingsUpdate,
	SiteTransferConfirmation,
	SshAccessStatus,
	SftpUser,
	SiteSshKey,
} from '../data/types';
import type { Query } from '@tanstack/react-query';

export function sitesQuery() {
	return {
		queryKey: [ 'sites', SITE_FIELDS, SITE_OPTIONS ],
		queryFn: fetchSites,
	};
}

export function siteQuery( siteIdOrSlug: string ) {
	return {
		queryKey: [ 'site', siteIdOrSlug, SITE_FIELDS, SITE_OPTIONS ],
		queryFn: () => fetchSite( siteIdOrSlug ),
	};
}

export function siteCurrentPlanQuery( siteIdOrSlug: string ) {
	return {
		queryKey: [ 'site', siteIdOrSlug, 'current-plan' ],
		queryFn: () => fetchCurrentPlan( siteIdOrSlug ),
	};
}

export function siteEngagementStatsQuery( siteIdOrSlug: string ) {
	return {
		queryKey: [ 'site', siteIdOrSlug, 'engagement-stats' ],
		queryFn: () => fetchSiteEngagementStats( siteIdOrSlug ),
	};
}

export function siteMediaStorageQuery( siteIdOrSlug: string ) {
	return {
		queryKey: [ 'site', siteIdOrSlug, 'media-storage' ],
		queryFn: () => fetchSiteMediaStorage( siteIdOrSlug ),
	};
}

export function siteMonitorUptimeQuery( siteIdOrSlug: string ) {
	return {
		queryKey: [ 'site', siteIdOrSlug, 'monitor-uptime' ],
		queryFn: () => fetchSiteMonitorUptime( siteIdOrSlug ),
	};
}

export function sitePHPVersionQuery( siteIdOrSlug: string ) {
	return {
		queryKey: [ 'site', siteIdOrSlug, 'php-version' ],
		queryFn: () => fetchPHPVersion( siteIdOrSlug ),
	};
}

export function sitePHPVersionMutation( siteSlug: string ) {
	return {
		mutationFn: ( version: string ) => updatePHPVersion( siteSlug, version ),
		onSuccess: () => {
			queryClient.invalidateQueries( { queryKey: [ 'site', siteSlug, 'php-version' ] } );
		},
	};
}

export function siteWordPressVersionQuery( siteSlug: string ) {
	return {
		queryKey: [ 'site', siteSlug, 'wp-version' ],
		queryFn: () => {
			return fetchWordPressVersion( siteSlug );
		},
	};
}

export function siteWordPressVersionMutation( siteSlug: string ) {
	return {
		mutationFn: ( version: string ) => updateWordPressVersion( siteSlug, version ),
		onSuccess: () => {
			queryClient.invalidateQueries( { queryKey: [ 'site', siteSlug, 'wp-version' ] } );
		},
	};
}

export function siteResetContentSummaryQuery( siteIdOrSlug: string ) {
	return {
		queryKey: [ 'site-reset-content', siteIdOrSlug ],
		queryFn: () => fetchSiteResetContentSummary( siteIdOrSlug ),
	};
}

export function resetSiteMutation( siteIdOrSlug: string ) {
	return {
		mutationFn: () => resetSite( siteIdOrSlug ),
	};
}

export function siteResetStatusQuery( siteIdOrSlug: string ) {
	return {
		queryKey: [ 'site-reset-status', siteIdOrSlug ],
		queryFn: () => fetchSiteResetStatus( siteIdOrSlug ),
	};
}

export function domainsQuery() {
	return {
		queryKey: [ 'domains' ],
		queryFn: fetchDomains,
	};
}

export function emailsQuery() {
	return {
		queryKey: [ 'emails' ],
		queryFn: fetchEmails,
	};
}

export function profileQuery() {
	return {
		queryKey: [ 'profile' ],
		queryFn: fetchProfile,
	};
}

export function profileMutation() {
	return {
		mutationFn: updateProfile,
		onSuccess: ( newData: Partial< Profile > ) => {
			queryClient.setQueryData( [ 'profile' ], ( oldData: Profile | undefined ) =>
				oldData ? { ...oldData, ...newData } : newData
			);
		},
	};
}

export function profileSshKeysQuery() {
	return {
		queryKey: [ 'profile', 'ssh-keys' ],
		queryFn: () => {
			return fetchProfileSshKeys();
		},
		retry: false, // Don't retry on 401 errors
		meta: {
			persist: false,
		},
	};
}

export function siteSettingsQuery( siteId: string ) {
	return {
		queryKey: [ 'site-settings', siteId ],
		queryFn: () => {
			return fetchSiteSettings( siteId );
		},
	};
}

export function siteSettingsMutation( siteId: string ) {
	return {
		mutationFn: ( newData: Partial< SiteSettings > ) => updateSiteSettings( siteId, newData ),
		onSuccess: ( newData: Partial< SiteSettings > ) => {
			queryClient.setQueryData( [ 'site-settings', siteId ], ( oldData: SiteSettings ) => ( {
				...oldData,
				...newData,
			} ) );
			queryClient.invalidateQueries( { queryKey: [ 'site', siteId ] } );
		},
	};
}

export function restoreSitePlanSoftwareMutation( siteId: string ) {
	return {
		mutationFn: () => restoreSitePlanSoftware( siteId ),
	};
}

export function siteOwnerTransferMutation( siteId: string ) {
	return {
		mutationFn: ( data: { new_site_owner: string } ) => siteOwnerTransfer( siteId, data ),
	};
}

export function siteOwnerTransferEligibilityCheckMutation( siteId: string ) {
	return {
		mutationFn: ( data: { new_site_owner: string } ) =>
			siteOwnerTransferEligibilityCheck( siteId, data ),
	};
}

export function siteOwnerTransferConfirmMutation( siteId: string ) {
	return {
		mutationFn: ( data: { hash: string } ) => siteOwnerTransferConfirm( siteId, data ),
		onSuccess: ( { transfer }: SiteTransferConfirmation ) => {
			if ( transfer ) {
				// Invalidate queries as the site has been transferred to new owner.
				queryClient.invalidateQueries( { queryKey: [ 'site', siteId ] } );
			}
		},
	};
}

export function deleteSiteMutation( siteId: string ) {
	return {
		mutationFn: () => deleteSite( siteId ),
		onSuccess: () => {
			queryClient.invalidateQueries( { queryKey: [ 'site', siteId ] } );
		},
	};
}

export function basicMetricsQuery( url: string ) {
	return {
		queryKey: [ 'url', 'basic-metrics', url ],
		queryFn: () => {
			return fetchBasicMetrics( url );
		},
	};
}

export function performanceInsightsQuery( url: string, token: string ) {
	return {
		queryKey: [ 'url', 'performance', url, token ],
		queryFn: () => {
			return fetchPerformanceInsights( url, token );
		},
		refetchInterval: ( query: Query< UrlPerformanceInsights > ) => {
			if ( query.state.data?.pagespeed?.status === 'completed' ) {
				return false;
			}
			return 5000;
		},
	};
}

export function sitePrimaryDataCenterQuery( siteId: string ) {
	return {
		queryKey: [ 'site', siteId, 'primary-data-center' ],
		queryFn: () => {
			return fetchPrimaryDataCenter( siteId );
		},
	};
}

export function siteStaticFile404Query( siteId: string ) {
	return {
		queryKey: [ 'site', siteId, 'static-file-404' ],
		queryFn: () => {
			return fetchStaticFile404( siteId );
		},
	};
}

export function siteStaticFile404Mutation( siteId: string ) {
	return {
		mutationFn: ( setting: string ) => updateStaticFile404( siteId, setting ),
		onSuccess: () => {
			queryClient.invalidateQueries( { queryKey: [ 'site', siteId, 'static-file-404' ] } );
		},
	};
}

export function agencyBlogQuery( siteId: string ) {
	return {
		queryKey: [ 'site', siteId, 'agency-blog' ],
		queryFn: () => {
			return fetchAgencyBlogBySiteId( siteId );
		},
	};
}

export function siteObjectCacheClearMutation( siteSlug: string ) {
	return {
		mutationFn: ( reason: string ) => clearObjectCache( siteSlug, reason ),
	};
}

export function siteEdgeCacheClearMutation( siteSlug: string ) {
	return {
		mutationFn: () => clearEdgeCache( siteSlug ),
	};
}

export function siteEdgeCacheStatusQuery( siteSlug: string ) {
	return {
		queryKey: [ 'site', siteSlug, 'edge-cache-status' ],
		queryFn: () => {
			return fetchEdgeCacheStatus( siteSlug );
		},
	};
}

export function siteEdgeCacheStatusMutation( siteSlug: string ) {
	return {
		mutationFn: ( active: boolean ) => updateEdgeCacheStatus( siteSlug, active ),
		onSuccess: ( active: boolean ) => {
			queryClient.setQueryData( [ 'site', siteSlug, 'edge-cache-status' ], active );
		},
	};
}

export function siteDefensiveModeQuery( siteSlug: string ) {
	return {
		queryKey: [ 'site', siteSlug, 'defensive-mode' ],
		queryFn: () => {
			return fetchEdgeCacheDefensiveMode( siteSlug );
		},
	};
}

export function siteDefensiveModeMutation( siteSlug: string ) {
	return {
		mutationFn: ( data: DefensiveModeSettingsUpdate ) =>
			updateEdgeCacheDefensiveMode( siteSlug, data ),
		onSuccess: ( data: DefensiveModeSettings ) => {
			queryClient.setQueryData( [ 'site', siteSlug, 'defensive-mode' ], data );
		},
	};
}

export function siteHasPurchasesCancelableQuery( siteId: string, userId: number ) {
	return {
		queryKey: [ 'site', siteId, 'purchases-cancelable' ],
		queryFn: () => {
			return fetchPurchases( siteId );
		},
		select: ( purchases: Purchase[] ) => {
			const cancelables = purchases
				.filter( ( purchase ) => {
					// Exclude inactive purchases and legacy premium theme purchases.
					if ( ! purchase.active || purchase.product_slug === 'premium_theme' ) {
						return false;
					}

					return purchase.is_cancelable;
				} )
				.filter( ( purchase ) => Number( purchase.user_id ) === userId );

			return cancelables.length > 0;
		},
	};
}

export function siteUserMeQuery( siteId: string ) {
	return {
		queryKey: [ 'site', siteId, 'user-me' ],
		queryFn: () => {
			return fetchSiteUserMe( siteId );
		},
	};
}

export function leaveSiteMutation( siteId: string ) {
	return {
		mutationFn: ( userId: number ) => leaveSite( siteId, userId ),
	};
}

export function p2HubP2sQuery( siteId: string, options: { limit?: number } = {} ) {
	return {
		queryKey: [ 'p2-hub-p2s', siteId, options ],
		queryFn: () => {
			return fetchP2HubP2s( siteId, options );
		},
	};
}

export function launchSiteMutation( siteIdOrSlug: string ) {
	return {
		mutationFn: () => launchSite( siteIdOrSlug ),
		onSuccess: () => {
			queryClient.invalidateQueries( { queryKey: [ 'site', siteIdOrSlug ] } );
			queryClient.invalidateQueries( { queryKey: [ 'site-settings', siteIdOrSlug ] } );
		},
	};
}

export function siteSftpUsersQuery( siteId: string ) {
	return {
		queryKey: [ 'site', siteId, 'sftp-users' ],
		queryFn: () => {
			return fetchSftpUsers( siteId );
		},
		meta: {
			persist: false,
		},
	};
}

const updateCurrentSftpUsers = ( currentSftpUsers: SftpUser[], sftpUser: SftpUser ) => {
	const index = currentSftpUsers.findIndex(
		( currentSftpUser ) => currentSftpUser.username === sftpUser.username
	);
	if ( index >= 0 ) {
		return [ ...currentSftpUsers.slice( 0, index ), sftpUser, ...currentSftpUsers.slice( 0 + 1 ) ];
	}

	return [ ...currentSftpUsers, sftpUser ];
};

export function siteSftpUsersCreateMutation( siteId: string ) {
	return {
		mutationFn: () => createSftpUser( siteId ),
		onSuccess: ( createdSftpUser: SftpUser ) => {
			queryClient.setQueryData(
				[ 'site', siteId, 'sftp-users' ],
				( currentSftpUsers: SftpUser[] ) =>
					updateCurrentSftpUsers( currentSftpUsers, createdSftpUser )
			);
		},
	};
}

export function siteSftpUsersResetPasswordMutation( siteId: string ) {
	return {
		mutationFn: ( sshUsername: string ) => resetSftpPassword( siteId, sshUsername ),
		onSuccess: ( updatedSftpUser: SftpUser ) => {
			queryClient.setQueryData(
				[ 'site', siteId, 'sftp-users' ],
				( currentSftpUsers: SftpUser[] ) =>
					updateCurrentSftpUsers( currentSftpUsers, updatedSftpUser )
			);
		},
	};
}

export function siteSshAccessStatusQuery( siteId: string ) {
	return {
		queryKey: [ 'site', siteId, 'ssh-access' ],
		queryFn: () => {
			return fetchSshAccessStatus( siteId );
		},
	};
}

export function siteSshAccessEnableMutation( siteId: string ) {
	return {
		mutationFn: () => enableSshAccess( siteId ),
		onSuccess: ( data: SshAccessStatus ) => {
			queryClient.setQueryData( [ 'site', siteId, 'ssh-access' ], data );
		},
	};
}

export function siteSshAccessDisableMutation( siteId: string ) {
	return {
		mutationFn: () => disableSshAccess( siteId ),
		onSuccess: ( data: SshAccessStatus ) => {
			queryClient.setQueryData( [ 'site', siteId, 'ssh-access' ], data );
		},
	};
}

export function siteSshKeysQuery( siteId: string ) {
	return {
		queryKey: [ 'site', siteId, 'ssh-keys' ],
		queryFn: () => {
			return fetchSiteSshKeys( siteId );
		},
	};
}

export function siteSshKeysAttachMutation( siteId: string ) {
	return {
		mutationFn: ( name: string ) => attachSiteSshKey( siteId, name ),
		onSuccess: () => {
			queryClient.invalidateQueries( { queryKey: [ 'site', siteId, 'ssh-keys' ] } );
		},
	};
}

export function siteSshKeysDetachMutation( siteId: string ) {
	return {
		mutationFn: ( siteSshKey: SiteSshKey ) =>
			detachSiteSshKey( siteId, siteSshKey.user_login, siteSshKey.name ),
		onSuccess: () => {
			queryClient.invalidateQueries( { queryKey: [ 'site', siteId, 'ssh-keys' ] } );
		},
	};
}
