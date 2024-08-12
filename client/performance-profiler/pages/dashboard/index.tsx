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
	const { url, tab, hash } = props;
	const [ activeTab, setActiveTab ] = React.useState< TabType >( tab );
	const { data: basicMetrics } = useUrlBasicMetricsQuery( url, hash, true );
	const { final_url: finalUrl, token } = basicMetrics || {};
	const { data: performanceInsights } = useUrlPerformanceInsightsQuery( finalUrl, token );
	const desktopLoaded = 'completed' === performanceInsights?.status;
	const mobileLoaded = typeof performanceInsights?.mobile === 'object';

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
			{ 'mobile' === activeTab && ! mobileLoaded && <LoadingScreen isSavedReport={ false } /> }
			{ 'mobile' === activeTab && mobileLoaded && (
				<PerformanceProfilerDashboardContent activeTab={ activeTab } />
			) }
			{ 'desktop' === activeTab && ! desktopLoaded && <LoadingScreen isSavedReport={ false } /> }
			{ 'desktop' === activeTab && desktopLoaded && (
				<PerformanceProfilerDashboardContent activeTab={ activeTab } />
			) }
		</div>
	);
};
