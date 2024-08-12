import { useTranslate } from 'i18n-calypso';
import React from 'react';
import './style.scss';
import DocumentHead from 'calypso/components/data/document-head';
import { useUrlBasicMetricsQuery } from 'calypso/data/site-profiler/use-url-basic-metrics-query';
import { useUrlPerformanceInsightsQuery } from 'calypso/data/site-profiler/use-url-performance-insights';
import { PerformanceProfilerDashboardContent } from 'calypso/performance-profiler/components/dashboard-content';
import { PerformanceProfilerHeader, TabType } from 'calypso/performance-profiler/components/header';
import { LoadingScreen } from '../loading-screen';

type PerformanceProfilerDashboardProps = {
	url: string;
	tab: TabType;
	hash: string;
};

export const PerformanceProfilerDashboard = ( props: PerformanceProfilerDashboardProps ) => {
	const translate = useTranslate();
	const { url, tab } = props;
	const [ activeTab, setActiveTab ] = React.useState< TabType >( tab );
	const { data: basicMetrics } = useUrlBasicMetricsQuery( url );
	const { final_url: finalUrl, token } = basicMetrics || {};
	const { data: performanceInsights } = useUrlPerformanceInsightsQuery( finalUrl, token );
	const isLoading = !! performanceInsights;

	const getOnTabChange = ( tab: TabType ) => {
		const queryParams = new URLSearchParams( window.location.search );
		queryParams.set( 'tab', tab );
		window.history.pushState( null, '', `?${ queryParams.toString() }` );
		setActiveTab( tab );
	};

	return (
		<div className="container">
			<DocumentHead title={ translate( 'Speed Test' ) } />
			<PerformanceProfilerHeader
				url={ url }
				activeTab={ activeTab }
				onTabChange={ getOnTabChange }
				showNavigationTabs
			/>
			{ isLoading && <LoadingScreen isSavedReport={ false } /> }
			{ ! isLoading && <PerformanceProfilerDashboardContent activeTab={ activeTab } /> }
		</div>
	);
};
