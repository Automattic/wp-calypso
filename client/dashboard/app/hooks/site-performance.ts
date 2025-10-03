import { basicMetricsQuery, sitePerformanceInsightsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import type { SitePerformanceReport } from '@automattic/api-core';

interface PerformanceData {
	hash: string | undefined;
	mobileReport: SitePerformanceReport | undefined;
	desktopReport: SitePerformanceReport | undefined;
	desktopScore: number | undefined;
	mobileScore: number | undefined;
	desktopLoaded: boolean;
	mobileLoaded: boolean;
	isLoading: boolean;
	isDesktopReportRunning: boolean;
	isMobileReportRunning: boolean;
	isDesktopReportError: boolean;
	isMobileReportError: boolean;
	isError: boolean;
	refetch: () => void;
}

/**
 * Checks if the report is failed.
 * @param report - The report to check.
 * @returns True if the report is failed, false otherwise.
 */
const isReportFailed = ( report: unknown ) => report === 'failed';

/**
 * Checks if the report is running. We consider a report running if it is 'running' or 'queued'.
 * @param report - The report to check.
 * @returns True if the report is running, false otherwise.
 */
const isReportRunning = ( report: unknown ) => 'running' === report || 'queued' === report;

export function usePerformanceData(
	url: string | undefined,
	hash: string | undefined
): PerformanceData {
	const {
		data: basicMetricsData,
		isLoading: isLoadingBasicMetrics,
		isError: isBasicMetricsError,
		refetch,
	} = useQuery( {
		...basicMetricsQuery( url as string ),
		refetchOnWindowFocus: false,
		enabled: !! url && ! hash,
	} );

	const token = basicMetricsData?.token || hash;

	const {
		data: performanceData,
		isLoading: isLoadingPerformanceInsights,
		isError: isInsightsError,
	} = useQuery( {
		...sitePerformanceInsightsQuery( url as string, token || '' ),
		refetchOnWindowFocus: false,
		retry: false,
		enabled: !! url && !! token,
	} );

	const desktop = performanceData?.pagespeed?.desktop;
	const mobile = performanceData?.pagespeed?.mobile;
	const desktopLoaded = typeof desktop === 'object';
	const mobileLoaded = typeof mobile === 'object';

	return {
		hash: token,
		mobileReport: mobileLoaded ? mobile : undefined,
		desktopReport: desktopLoaded ? desktop : undefined,
		desktopScore: desktop?.overall_score,
		mobileScore: mobile?.overall_score,
		desktopLoaded,
		mobileLoaded,
		isLoading: isLoadingBasicMetrics || isLoadingPerformanceInsights,
		isDesktopReportRunning: isReportRunning( desktop ),
		isMobileReportRunning: isReportRunning( mobile ),
		isDesktopReportError: isReportFailed( desktop ),
		isMobileReportError: isReportFailed( mobile ),
		isError: isBasicMetricsError || isInsightsError,
		refetch,
	};
}
