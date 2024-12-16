import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import React, { useEffect, useRef } from 'react';
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
import { profilerVersion } from 'calypso/performance-profiler/utils/profiler-version';
import { updateQueryParams } from 'calypso/performance-profiler/utils/query-params';
import { LoadingScreen } from '../loading-screen';

import './style.scss';

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
	const [ activeTab, setActiveTab ] = React.useState< TabType >( tab );
	const {
		data: basicMetrics,
		isError: isBasicMetricsError,
		isFetched,
	} = useUrlBasicMetricsQuery( url, hash, true, translate.localeSlug );
	const { final_url: finalUrl, token } = basicMetrics || {};
	const { data, isError: isPerformanceInsightsError } = useUrlPerformanceInsightsQuery( url, hash );
	const performanceInsights = data?.pagespeed;

	const isError =
		isBasicMetricsError ||
		isPerformanceInsightsError ||
		'failed' === performanceInsights?.mobile ||
		'failed' === performanceInsights?.desktop;
	const desktopLoaded = 'completed' === performanceInsights?.status;
	const mobileLoaded = typeof performanceInsights?.mobile === 'object';

	const siteUrl = new URL( url );

	if ( isFetched && finalUrl ) {
		performance.mark( 'test-started' );
		recordTracksEvent( 'calypso_performance_profiler_test_started', {
			url: finalUrl,
			version: profilerVersion(),
		} );
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
