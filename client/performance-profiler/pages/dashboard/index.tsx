import page from '@automattic/calypso-router';
import { useTranslate } from 'i18n-calypso';
import React, { useEffect } from 'react';
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
	const { data: performanceInsights } = useUrlPerformanceInsightsQuery( url, hash );
	const desktopLoaded = 'completed' === performanceInsights?.status;
	const mobileLoaded = typeof performanceInsights?.mobile === 'object';

	const updateQueryParams = ( params: Record< string, string >, forceReload = false ) => {
		const queryParams = new URLSearchParams( window.location.search );
		Object.keys( params ).forEach( ( key ) => {
			if ( params[ key ] ) {
				queryParams.set( key, params[ key ] );
			}
		} );

		// If forceReload is true, we want to reload the page with the new query params instead of just updating the URL
		if ( forceReload ) {
			page( `/speed-test-tool?${ queryParams.toString() }` );
		} else {
			window.history.replaceState( {}, '', `?${ queryParams.toString() }` );
		}
	};

	// Append hash to the URL if it's not there to avoid losing it on page reload
	useEffect( () => {
		if ( ! hash && token ) {
			updateQueryParams( { hash: token, url: finalUrl ?? url }, true );
		}
	}, [ hash, token, finalUrl, url ] );

	const getOnTabChange = ( tab: TabType ) => {
		updateQueryParams( { tab: tab } );
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
