import { useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import type { SiteSettings, BasicMetricsData, UrlPerformanceInsights } from '../data/types';

interface PerformanceData {
	desktopScore: number | undefined;
	mobileScore: number | undefined;
	desktopLoaded: boolean;
	mobileLoaded: boolean;
	isLoadingSiteSettings: boolean;
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

interface QueryState {
	state: {
		data?: {
			pagespeed?: {
				status: string;
			};
		};
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

export function usePerformanceData( siteId: string, url: string ): PerformanceData {
	const { data: siteSettings, isLoading: isLoadingSiteSettings } = useQuery(
		siteSettingsQuery( siteId )
	);

	const wpcomPerformanceReportUrl: string =
		siteSettings?.settings?.wpcom_performance_report_url || '';
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
