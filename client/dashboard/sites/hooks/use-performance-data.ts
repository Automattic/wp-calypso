import { useQuery } from '@tanstack/react-query';
import { siteSettingsQuery, basicMetricsQuery, performanceInsightsQuery } from '../../app/queries';
import { UrlPerformanceInsights } from '../../data/types';

interface PerformanceData {
	performanceData: UrlPerformanceInsights | undefined;
	desktopScore: number | undefined;
	mobileScore: number | undefined;
	desktopLoaded: boolean;
	mobileLoaded: boolean;
	isLoading: boolean;
}

export function usePerformanceData( siteId: string, url: string ): PerformanceData {
	const { data: siteSettings, isLoading: isLoadingSiteSettings } = useQuery( {
		...siteSettingsQuery( siteId ),
		refetchOnWindowFocus: false,
		retry: false,
		enabled: !! siteId,
	} );

	const wpcomPerformanceReportUrl: string = siteSettings?.wpcom_performance_report_url || '';
	const [ , cachedHash ] = wpcomPerformanceReportUrl.split( '&hash=' );

	const { data: basicMetricsData, isLoading: isLoadingBasicMetrics } = useQuery( {
		...basicMetricsQuery( url ),
		refetchOnWindowFocus: false,
		enabled: !! url && ! isLoadingSiteSettings && ! cachedHash,
	} );

	const token = cachedHash || basicMetricsData?.token;

	const { data: performanceData, isLoading: isLoadingPerformanceInsights } = useQuery( {
		...performanceInsightsQuery( url, token || '' ),
		refetchOnWindowFocus: false,
		enabled: !! url && !! token,
	} );

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
		performanceData,
		desktopScore,
		mobileScore,
		desktopLoaded,
		mobileLoaded,
		isLoading: isLoadingSiteSettings || isLoadingBasicMetrics || isLoadingPerformanceInsights,
	};
}
