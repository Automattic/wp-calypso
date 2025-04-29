import { useQuery } from '@tanstack/react-query';
import { siteSettingsQuery, basicMetricsQuery, performanceInsightsQuery } from '../app/queries';

interface PerformanceData {
	desktopScore: number | undefined;
	mobileScore: number | undefined;
	desktopLoaded: boolean;
	mobileLoaded: boolean;
	isLoadingSiteSettings: boolean;
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
