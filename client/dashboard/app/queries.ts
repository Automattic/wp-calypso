import { useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
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
} from '../data';
import { queryClient } from './query-client';
import type {
	Profile,
	SiteSettings,
	BasicMetricsData,
	UrlPerformanceInsights,
} from '../data/types';

export function sitesQuery() {
	return {
		queryKey: [ 'sites' ],
		queryFn: fetchSites,
	};
}

export function siteQuery( siteId: string ) {
	return {
		queryKey: [ 'site', siteId ],
		queryFn: async () => {
			// Site usually takes the longest, so kick it off first.
			const sitePromise = fetchSite( siteId );
			// Kick off all independent promises in parallel.
			const mediaStoragePromise = fetchSiteMediaStorage( siteId );
			const currentPlanPromise = fetchCurrentPlan( siteId );
			const primaryDomainPromise = fetchSitePrimaryDomain( siteId );
			const engagementStatsPromise = fetchSiteEngagementStats( siteId );
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
					? fetchSiteMonitorUptime( siteId )
					: undefined,
				site.options?.is_wpcom_atomic ? fetchPHPVersion( siteId ) : undefined,
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

interface QueryState {
	state: {
		data?: {
			pagespeed?: {
				status: string;
			};
		};
	};
}

export function usePerformanceData( siteId: string, url: string ) {
	const { data: siteSettings, isLoading: isLoadingSiteSettings } = useQuery(
		siteSettingsQuery( siteId )
	);

	const wpcomPerformanceReportUrl = siteSettings?.settings?.wpcom_performance_report_url || '';
	const [ , cachedHash ] = wpcomPerformanceReportUrl.split( '&hash=' );

	const { data: basicMetricsData } = useQuery(
		basicMetricsQuery( url, isLoadingSiteSettings, cachedHash )
	);

	const token = cachedHash || basicMetricsData?.token;

	const { data: performanceData } = useQuery( performanceInsightsQuery( url, token || '' ) );

	const desktopLoaded = typeof performanceData?.pagespeed?.desktop === 'object';
	const mobileLoaded = typeof performanceData?.pagespeed?.mobile === 'object';

	const desktopScore =
		desktopLoaded && typeof performanceData?.pagespeed.desktop === 'object'
			? Math.round( performanceData.pagespeed.desktop.overall_score * 100 )
			: undefined;

	const mobileScore =
		mobileLoaded && typeof performanceData?.pagespeed.mobile === 'object'
			? Math.round( performanceData.pagespeed.mobile.overall_score * 100 )
			: undefined;

	return {
		desktopScore,
		mobileScore,
		desktopLoaded,
		mobileLoaded,
		isLoadingSiteSettings,
	};
}

function siteSettingsQuery( siteId: string ) {
	return {
		queryKey: [ 'site-settings', siteId ],
		queryFn: () =>
			wp.req.get(
				{ path: `/sites/${ siteId }/settings` },
				{ apiVersion: '1.4' }
			) as Promise< SiteSettings >,
		refetchOnWindowFocus: false,
		retry: false,
		enabled: !! siteId,
	};
}

function basicMetricsQuery( url: string, isLoadingSiteSettings: boolean, cachedHash: string ) {
	return {
		queryKey: [ 'url', 'basic-metrics', url ],
		queryFn: () =>
			wp.req.get(
				{
					path: '/site-profiler/metrics/basic',
					apiNamespace: 'wpcom/v2',
				},
				// Important: advance=1 is needed to get the `token` and request advanced metrics.
				{ url, advance: '1' }
			) as Promise< BasicMetricsData >,
		refetchOnWindowFocus: false,
		enabled: !! url && ! isLoadingSiteSettings && ! cachedHash,
	};
}

function performanceInsightsQuery( url: string, token: string ) {
	return {
		queryKey: [ 'url', 'performance', url, token ],
		queryFn: () =>
			wp.req.get(
				{
					path: '/site-profiler/metrics/advanced/insights',
					apiNamespace: 'wpcom/v2',
				},
				{ url, advance: '1', hash: token }
			) as Promise< UrlPerformanceInsights >,
		enabled: !! url && !! token,
		refetchOnWindowFocus: false,
		refetchInterval: ( query: QueryState ) => {
			if ( query.state.data?.pagespeed?.status === 'completed' ) {
				return false;
			}
			return 5000;
		},
	};
}
