import {
	fetchSites,
	fetchSite,
	fetchSiteMediaStorage,
	fetchSiteMonitorUptime,
	fetchPHPVersion,
	fetchCurrentPlan,
	fetchSitePrimaryDomain,
	fetchSiteEngagementStats,
	fetchDomains,
	fetchEmails,
	fetchProfile,
	updateProfile,
	fetchSiteSettings,
	fetchBasicMetrics,
	fetchPerformanceInsights,
	updateSiteSettings,
} from '../data';
import { queryClient } from './query-client';
import type { Profile, SiteSettings, UrlPerformanceInsights } from '../data/types';
import type { Query } from '@tanstack/react-query';

export function sitesQuery() {
	return {
		queryKey: [ 'sites' ],
		queryFn: fetchSites,
	};
}

export function siteQuery( siteIdOrSlug: string ) {
	return {
		queryKey: [ 'site', siteIdOrSlug ],
		queryFn: async () => {
			// Site usually takes the longest, so kick it off first.
			const sitePromise = fetchSite( siteIdOrSlug );
			// Kick off all independent promises in parallel.
			const mediaStoragePromise = fetchSiteMediaStorage( siteIdOrSlug );
			const currentPlanPromise = fetchCurrentPlan( siteIdOrSlug );
			const primaryDomainPromise = fetchSitePrimaryDomain( siteIdOrSlug );
			const engagementStatsPromise = fetchSiteEngagementStats( siteIdOrSlug );
			const site = await sitePromise;
			const [
				mediaStorage,
				currentPlan,
				primaryDomain,
				engagementStats,
				siteMonitorUptime,
				phpVersion,
			] = await Promise.all( [
				mediaStoragePromise,
				currentPlanPromise,
				primaryDomainPromise,
				engagementStatsPromise,
				// Kick off dependent promises in parallel.
				site.jetpack && site.jetpack_modules.includes( 'monitor' )
					? fetchSiteMonitorUptime( site.ID )
					: undefined,
				site.options?.is_wpcom_atomic ? fetchPHPVersion( site.ID ) : undefined,
			] );
			return {
				site,
				mediaStorage,
				siteMonitorUptime,
				phpVersion,
				currentPlan,
				primaryDomain,
				engagementStats,
			};
		},
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

const profileQueryKey = [ 'profile' ];

export function profileQuery() {
	return {
		queryKey: profileQueryKey,
		queryFn: fetchProfile,
	};
}

export function profileMutation() {
	return {
		mutationFn: updateProfile,
		onSuccess: ( newData: Partial< Profile > ) => {
			queryClient.setQueryData( profileQueryKey, ( oldData: Profile | undefined ) =>
				oldData ? { ...oldData, ...newData } : newData
			);
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
