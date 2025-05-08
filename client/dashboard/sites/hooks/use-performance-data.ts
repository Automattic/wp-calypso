import { useQuery } from '@tanstack/react-query';
import { basicMetricsQuery, performanceInsightsQuery } from '../../app/queries';
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
	refetch: () => void;
}

const isReportFailed = ( report: unknown ) => report === 'failed';

export function usePerformanceData(
	url: string | undefined,
	hash: string | undefined
): PerformanceData {
	const {
		data: basicMetricsData,
		isLoading: isLoadingBasicMetrics,
		isError: isBasicMetricsError,
	} = useQuery( {
		...basicMetricsQuery( url as string ),
		refetchOnWindowFocus: false,
		enabled: !! url && ! hash,
	} );

	const token = hash || basicMetricsData?.token;

	const {
		data: performanceData,
		isLoading: isLoadingPerformanceInsights,
		isError: isInsightsError,
		refetch,
	} = useQuery( {
		...performanceInsightsQuery( url as string, token || '' ),
		refetchOnWindowFocus: false,
		retry: false,
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
		isLoading: isLoadingBasicMetrics || isLoadingPerformanceInsights,
		isRunningDesktopReport: ! desktopLoaded && 'running' === performanceData?.pagespeed?.desktop,
		isRunningMobileReport: ! mobileLoaded && 'running' === performanceData?.pagespeed?.mobile,
		isError,
		refetch,
	};
}
