import { useState, useCallback, useEffect } from 'react';
import { useUrlBasicMetricsQuery } from 'calypso/data/site-profiler/use-url-basic-metrics-query';
import { useUrlPerformanceInsightsQuery } from 'calypso/data/site-profiler/use-url-performance-insights';
import { TabType } from 'calypso/performance-profiler/components/header';
import { isValidURL } from '../utils';

export const usePerformanceReport = (
	setIsSavingPerformanceReportUrl: ( isSaving: boolean ) => void,
	refetchPages: () => void,
	savePerformanceReportUrl: (
		pageId: string,
		wpcom_performance_report_url: { url: string; hash: string }
	) => Promise< void >,
	currentPageId: string,
	wpcom_performance_report_url: { url: string; hash: string } | undefined,
	activeTab: TabType
) => {
	const { url = '', hash = '' } = wpcom_performance_report_url || {};

	const [ retestState, setRetestState ] = useState( 'idle' );

	const {
		data: basicMetrics,
		isError: isBasicMetricsError,
		isFetched: isBasicMetricsFetched,
		isLoading: isLoadingBasicMetrics,
		refetch: requeueAdvancedMetrics,
	} = useUrlBasicMetricsQuery( url, hash, true );

	const { final_url: finalUrl, token } = basicMetrics || {};

	useEffect( () => {
		if ( token && finalUrl && isValidURL( finalUrl ) ) {
			setIsSavingPerformanceReportUrl( true );
			savePerformanceReportUrl( currentPageId, { url: finalUrl, hash: token } )
				.then( () => {
					refetchPages();
				} )
				.finally( () => {
					setIsSavingPerformanceReportUrl( false );
				} );
		}
		// We only want to run this effect when the token changes.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ token ] );

	const {
		data,
		status: insightsStatus,
		isError: isInsightsError,
		isLoading: isLoadingInsights,
	} = useUrlPerformanceInsightsQuery( url, token ?? hash );

	const performanceInsights = data?.pagespeed;

	const isReportFailed = ( report: unknown ) => report === 'failed';

	const mobileReport =
		typeof performanceInsights?.mobile === 'string' ? undefined : performanceInsights?.mobile;
	const desktopReport =
		typeof performanceInsights?.desktop === 'string' ? undefined : performanceInsights?.desktop;

	const performanceReport = activeTab === 'mobile' ? mobileReport : desktopReport;

	const desktopLoaded =
		typeof performanceInsights?.desktop === 'object' || performanceInsights?.desktop === 'failed';
	const mobileLoaded =
		typeof performanceInsights?.mobile === 'object' || performanceInsights?.mobile === 'failed';

	const isError =
		isBasicMetricsError ||
		isInsightsError ||
		isReportFailed( performanceInsights?.mobile ) ||
		isReportFailed( performanceInsights?.desktop );

	const getHashOrToken = (
		hash: string | undefined,
		token: string | undefined,
		isReportLoaded: boolean
	) => {
		if ( hash ) {
			return hash;
		} else if ( token && isReportLoaded ) {
			return token;
		}
		return '';
	};

	const testAgain = useCallback( async () => {
		setRetestState( 'queueing-advanced' );
		const result = await requeueAdvancedMetrics();
		setRetestState( 'polling-for-insights' );
		return result;
	}, [ requeueAdvancedMetrics ] );

	if (
		retestState === 'polling-for-insights' &&
		insightsStatus === 'success' &&
		( activeTab === 'mobile' ? mobileLoaded : desktopLoaded )
	) {
		setRetestState( 'idle' );
	}

	return {
		performanceReport,
		url: finalUrl ?? url,
		hash: getHashOrToken( hash, token, activeTab === 'mobile' ? mobileLoaded : desktopLoaded ),
		isLoading:
			isLoadingBasicMetrics ||
			isLoadingInsights ||
			( activeTab === 'mobile' ? ! mobileLoaded : ! desktopLoaded ),
		isError,
		isBasicMetricsFetched,
		testAgain,
		isRetesting: retestState !== 'idle',
	};
};
