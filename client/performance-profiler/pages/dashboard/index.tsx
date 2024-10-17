import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import React, { useEffect, useRef } from 'react';
import './style.scss';
import DocumentHead from 'calypso/components/data/document-head';
import { PerformanceReport } from 'calypso/data/site-profiler/types';
import { useUrlBasicMetricsQuery } from 'calypso/data/site-profiler/use-url-basic-metrics-query';
import { useUrlPerformanceInsightsQuery } from 'calypso/data/site-profiler/use-url-performance-insights';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { PerformanceProfilerDashboardContent } from 'calypso/performance-profiler/components/dashboard-content';
import { PerformanceProfilerHeader, TabType } from 'calypso/performance-profiler/components/header';
import {
	MessageDisplay,
	ErrorSecondLine,
} from 'calypso/performance-profiler/components/message-display';
import { updateQueryParams } from 'calypso/performance-profiler/utils/query-params';
import { LoadingScreen } from '../loading-screen';

type PerformanceProfilerDashboardProps = {
	url: string;
	tab: TabType;
	hash: string;
	filter?: string;
};

export const PerformanceProfilerDashboard = ( props: PerformanceProfilerDashboardProps ) => {
	const translate = useTranslate();
	const { url, tab, hash, filter } = props;
	const isSavedReport = useRef( !! hash );
	const testStartTime = useRef( 0 );
	const [ activeTab, setActiveTab ] = React.useState< TabType >( tab );
	const {
		data: basicMetrics,
		isError: isBasicMetricsError,
		isFetched,
	} = useUrlBasicMetricsQuery( url, hash, true );
	const { final_url: finalUrl, token } = basicMetrics || {};
	const { data: performanceInsights, isError: isPerformanceInsightsError } =
		useUrlPerformanceInsightsQuery( url, hash );
	const isError =
		isBasicMetricsError ||
		isPerformanceInsightsError ||
		'failed' === performanceInsights?.mobile ||
		'failed' === performanceInsights?.desktop;
	const desktopLoaded = 'completed' === performanceInsights?.status;
	const mobileLoaded = typeof performanceInsights?.mobile === 'object';

	const siteUrl = new URL( url );

	if ( isFetched && finalUrl ) {
		recordTracksEvent( 'calypso_performance_profiler_test_started', {
			url: finalUrl,
		} );
		testStartTime.current = Date.now();
	}

	// Append hash to the URL if it's not there to avoid losing it on page reload
	useEffect( () => {
		if ( ! hash && token ) {
			updateQueryParams( { hash: token, url: finalUrl ?? url }, true );
		}
	}, [ hash, token, finalUrl, url ] );

	const getOnTabChange = ( tab: TabType ) => {
		updateQueryParams( { tab: tab } );
		recordTracksEvent( 'calypso_performance_profiler_tab_changed', {
			url: siteUrl.href,
			tab,
		} );
		setActiveTab( tab );
	};

	const mobileReport =
		typeof performanceInsights?.mobile === 'string' ? undefined : performanceInsights?.mobile;
	const desktopReport =
		typeof performanceInsights?.desktop === 'string' ? undefined : performanceInsights?.desktop;
	const performanceReport =
		activeTab === TabType.mobile
			? ( mobileReport as PerformanceReport )
			: ( desktopReport as PerformanceReport );

	if ( testStartTime.current && desktopLoaded && mobileLoaded ) {
		recordTracksEvent( 'calypso_performance_profiler_test_completed', {
			url: siteUrl.href,
			duration: Date.now() - testStartTime.current,
			mobile_score: mobileReport?.overall_score,
			desktop_score: desktopReport?.overall_score,
		} );
	}

	return (
		<div className="peformance-profiler-dashboard-container">
			<DocumentHead title={ translate( 'Speed Test' ) } />
			{ isError ? (
				<MessageDisplay
					isErrorMessage
					displayBadge
					message={
						<>
							{ translate( 'We couldn‘t test the performance of %s', {
								args: [ siteUrl.host ],
							} ) }
							<br />
							<ErrorSecondLine>
								{ translate(
									'We were unable to reliably load the page you requested. Make sure you are testing the correct URL and that the server is properly responding to all requests. '
								) }
							</ErrorSecondLine>
						</>
					}
					ctaText={ translate( '← Back to speed test' ) }
					ctaHref="/speed-test"
					ctaIcon="arrow-left"
				/>
			) : (
				<>
					<PerformanceProfilerHeader
						url={ url }
						timestamp={ performanceReport?.timestamp }
						activeTab={ activeTab }
						onTabChange={ getOnTabChange }
						showWPcomBadge={ performanceReport?.is_wpcom }
						showNavigationTabs
						shareLink={ performanceReport?.share_link }
					/>
					<div
						className={ clsx( 'loading-container', 'mobile-loading', {
							'is-active': activeTab === TabType.mobile,
							'is-loading': ! mobileLoaded,
						} ) }
					>
						<LoadingScreen isSavedReport={ isSavedReport.current } key="mobile-loading" />
					</div>
					<div
						className={ clsx( 'loading-container', 'desktop-loading', {
							'is-active': activeTab === TabType.desktop,
							'is-loading': ! desktopLoaded,
						} ) }
					>
						<LoadingScreen isSavedReport={ isSavedReport.current } key="desktop-loading" />
					</div>
					{ ( ( activeTab === TabType.mobile && mobileLoaded ) ||
						( activeTab === TabType.desktop && desktopLoaded ) ) && (
						<PerformanceProfilerDashboardContent
							performanceReport={ performanceReport }
							activeTab={ activeTab }
							url={ finalUrl ?? url }
							hash={ hash }
							filter={ filter }
							displayMigrationBanner={ ! performanceReport?.is_wpcom }
							onRecommendationsFilterChange={ ( filter ) => updateQueryParams( { filter }, true ) }
						/>
					) }
				</>
			) }
		</div>
	);
};
