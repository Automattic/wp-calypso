import { basicMetricsQuery, sitePerformanceInsightsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import type { SitePerformanceReport } from '@automattic/api-core';

type ReportType = 'mobile' | 'desktop';

interface PerformanceData {
	refetch: () => void;
	loadingState: ( reportType: ReportType ) => {
		isLoading: boolean;
		message: string | null;
	} | null;
	getReport: ( type: ReportType ) => SitePerformanceReport | undefined;
	hasError: ( type: ReportType ) => boolean;
	hasCompleted: boolean;
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
	hash: string | undefined,
	runNewReport: boolean
): PerformanceData {
	const shouldFetchToken = runNewReport || ! hash;

	const {
		data: basicMetricsData,
		isLoading: isLoadingBasicMetrics,
		isFetching: isFetchingBasicMetrics,
		isError: isBasicMetricsError,
		refetch,
	} = useQuery( {
		...basicMetricsQuery( url as string ),
		refetchOnWindowFocus: false,
		enabled: !! url && shouldFetchToken,
	} );

	const token = basicMetricsData?.token || hash;

	const {
		data: performanceData,
		isLoading: isLoadingPerformanceInsights,
		isFetching: isFetchingPerformanceInsights,
		isError: isInsightsError,
	} = useQuery( {
		...sitePerformanceInsightsQuery( url as string, token || '' ),
		refetchOnWindowFocus: false,
		retry: false,
		enabled: !! url && !! token,
		staleTime: 0,
	} );

	const desktop = performanceData?.pagespeed?.desktop;
	const mobile = performanceData?.pagespeed?.mobile;
	const desktopLoaded = typeof desktop === 'object';
	const mobileLoaded = typeof mobile === 'object';

	const getLoadingState = ( reportType: ReportType ) => {
		// If we have loaded reports, never show loading
		if ( reportType === 'desktop' ? desktopLoaded : mobileLoaded ) {
			return { isLoading: false, message: null };
		}

		if ( shouldFetchToken ) {
			if ( isLoadingBasicMetrics || isFetchingBasicMetrics ) {
				return { isLoading: true, message: 'Generating new report token...' };
			}

			if ( isLoadingPerformanceInsights || isFetchingPerformanceInsights ) {
				return { isLoading: true, message: 'Running new report...' };
			}

			if ( isReportRunning( reportType === 'desktop' ? desktop : mobile ) ) {
				return { isLoading: true, message: 'Running new report...' };
			}
		} else if ( isLoadingPerformanceInsights || isFetchingPerformanceInsights ) {
			return { isLoading: true, message: 'Loading your data...' };
		}

		return { isLoading: false, message: null };
	};

	const getReport = ( type: ReportType ): SitePerformanceReport | undefined => {
		if ( typeof performanceData?.pagespeed[ type ] === 'string' ) {
			return undefined;
		}

		return performanceData?.pagespeed[ type ];
	};

	return {
		hasError: ( type: ReportType ) =>
			isReportFailed( getReport( type ) ) || isBasicMetricsError || isInsightsError,
		refetch,
		loadingState: getLoadingState,
		getReport: ( type: ReportType ) => getReport( type ),
		hasCompleted: getReport( 'desktop' ) !== undefined && getReport( 'mobile' ) !== undefined,
	};
}
