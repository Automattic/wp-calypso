import {
	fetchSites,
	fetchSite,
	fetchSiteMediaStorage,
	fetchSiteMonitorUptime,
	fetchPHPVersion,
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
} from '../data';
import { SITE_FIELDS, SITE_OPTIONS } from '../data/constants';
import { queryClient } from './query-client';
import type { Profile, SiteSettings, UrlPerformanceInsights } from '../data/types';
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

export function restoreSitePlanSoftwareMutation( siteId: string ) {
	return {
		mutationFn: () => restoreSitePlanSoftware( siteId ),
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
