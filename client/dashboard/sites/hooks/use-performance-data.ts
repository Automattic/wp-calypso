import { useQuery } from '@tanstack/react-query';
import { siteSettingsQuery, basicMetricsQuery, performanceInsightsQuery } from '../../app/queries';
import { PerformanceReport } from '../../data/types';

interface PerformanceData {
	hash: string | undefined;
	mobileReport: PerformanceReport | undefined;
	desktopReport: PerformanceReport | undefined;
	desktopScore: number | undefined;
	mobileScore: number | undefined;
	desktopLoaded: boolean;
	mobileLoaded: boolean;
	isLoading: boolean;
	isRunningDesktopReport: boolean;
	isRunningMobileReport: boolean;
	isError: boolean;
}

const isReportFailed = ( report: unknown ) => report === 'failed';

export function usePerformanceData( siteId: string, url: string ): PerformanceData {
	const {
		data: siteSettings,
		isLoading: isLoadingSiteSettings,
		isError: isSiteSettingsError,
	} = useQuery( {
		...siteSettingsQuery( siteId ),
		refetchOnWindowFocus: false,
		retry: false,
		enabled: !! siteId,
	} );

	const wpcomPerformanceReportUrl: string = siteSettings?.wpcom_performance_report_url || '';
	const [ , cachedHash ] = wpcomPerformanceReportUrl.split( '&hash=' );

	const {
		data: basicMetricsData,
		isLoading: isLoadingBasicMetrics,
		isError: isBasicMetricsError,
	} = useQuery( {
		...basicMetricsQuery( url ),
		refetchOnWindowFocus: false,
		enabled: !! url && ! isLoadingSiteSettings && ! cachedHash,
	} );

	const token = cachedHash || basicMetricsData?.token;

	const {
		data: performanceData,
		isLoading: isLoadingPerformanceInsights,
		isError: isInsightsError,
	} = useQuery( {
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

	const desktopReport =
		typeof performanceData?.pagespeed?.desktop === 'object'
			? performanceData.pagespeed.desktop
			: undefined;

	const mobileReport =
		typeof performanceData?.pagespeed?.mobile === 'object'
			? performanceData.pagespeed.mobile
			: undefined;

	const isError =
		isSiteSettingsError ||
		isBasicMetricsError ||
		isInsightsError ||
		isReportFailed( performanceData?.pagespeed?.mobile ) ||
		isReportFailed( performanceData?.pagespeed.desktop );

	return {
		hash: token,
		mobileReport,
		desktopReport,
		desktopScore,
		mobileScore,
		desktopLoaded,
		mobileLoaded,
		isLoading: isLoadingSiteSettings || isLoadingBasicMetrics || isLoadingPerformanceInsights,
		isRunningDesktopReport: ! desktopLoaded && 'running' === performanceData?.pagespeed?.desktop,
		isRunningMobileReport: ! mobileLoaded && 'running' === performanceData?.pagespeed?.mobile,
		isError,
	};
}
