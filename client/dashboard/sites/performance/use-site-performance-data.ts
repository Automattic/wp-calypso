import { basicMetricsQuery, sitePerformanceInsightsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import type { BasicMetricsData, SitePerformanceReport } from '@automattic/api-core';
import type { QueryObserverResult } from '@tanstack/react-query';

type ReportType = 'mobile' | 'desktop';

interface PerformanceData {
	hasCompleted: boolean;
	createNewReport: () => Promise< QueryObserverResult< BasicMetricsData, Error > >;
	getReport: ( type: ReportType ) => SitePerformanceReport | undefined;
	hasError: ( type: ReportType ) => boolean;
	isLoadingExistingReport: ( reportType: ReportType ) => boolean;
	isLoadingNewReport: ( reportType: ReportType ) => boolean;
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

export function useSitePerformanceData(
	url: string | undefined,
	hash: string | undefined,
	runNewReport?: boolean
): PerformanceData {
	const shouldFetchToken = ! hash || !! runNewReport;

	const {
		data: basicMetricsData,
		isLoading: isLoadingBasicMetrics,
		isFetching: isFetchingBasicMetrics,
		isError: isBasicMetricsError,
		refetch: createNewReport,
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
	} );

	const getReport = ( type: ReportType ): SitePerformanceReport | undefined => {
		if ( typeof performanceData?.pagespeed[ type ] === 'string' ) {
			return undefined;
		}

		return performanceData?.pagespeed[ type ];
	};

	const isLoadingExistingReport = ( reportType: ReportType ) => {
		if ( getReport( reportType ) !== undefined ) {
			return false;
		}

		return ! shouldFetchToken && ( isLoadingPerformanceInsights || isFetchingPerformanceInsights );
	};

	const isLoadingNewReport = ( reportType: ReportType ) => {
		if ( getReport( reportType ) !== undefined ) {
			return false;
		}

		if ( shouldFetchToken ) {
			if ( isLoadingBasicMetrics || isFetchingBasicMetrics ) {
				return true;
			}

			if ( isLoadingPerformanceInsights || isFetchingPerformanceInsights ) {
				return true;
			}

			if ( isReportRunning( performanceData?.pagespeed?.[ reportType ] ) ) {
				return true;
			}
		}

		return false;
	};

	return {
		createNewReport,
		getReport,
		hasCompleted: !! getReport( 'desktop' ) && !! getReport( 'mobile' ),
		hasError: ( type: ReportType ) =>
			isReportFailed( getReport( type ) ) || isBasicMetricsError || isInsightsError,
		isLoadingExistingReport,
		isLoadingNewReport,
	};
}
