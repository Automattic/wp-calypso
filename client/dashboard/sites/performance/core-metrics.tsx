import { Tabs } from '@automattic/components/src/tabs';
import { __experimentalGrid as Grid } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { useState } from 'react';
import CoreMetricsContent from './core-metrics-content';
import CoreMetricsTabs from './core-metrics-tabs';
import { Metrics } from './utils';
import type { PerformanceReport } from '@automattic/api-core';

export type PerformanceMetricsHistory = {
	collection_period: Array< string | { year: number; month: number; day: number } >;
	metrics: {
		ttfb?: number[];
		fcp?: number[];
		lcp?: number[];
		cls?: number[];
		inp?: number[];
		tbt?: number[];
		overall?: number[];
	};
};

export interface PerformanceMetricsItemQueryResponse {
	id: string;
	title?: string;
	description?: string;
	type: 'warning' | 'fail';
	displayValue?: string;
	details?: PerformanceMetricsDetailsQueryResponse;
	metricSavings?: { FCP?: number; LCP?: number; CLS?: number; INP?: number };
}

export interface PerformanceMetricsDetailsQueryResponse {
	type: 'table' | 'opportunity' | 'list' | 'criticalrequestchain';
	headings?: Array< { key: string; label: string; valueType: string } >;
	items?: Array< {
		[ key: string ]: string | number | { [ key: string ]: unknown };
	} >;
	chains?: Array< { [ key: string ]: unknown } >;
}

export type ScreenshotNode = {
	width: number;
	right: number;
	bottom: number;
	top: number;
	height: number;
	left: number;
};

export interface FullPageScreenshot {
	screenshot: {
		data: string;
		height: number;
		width: number;
	};
	nodes: Record< string, ScreenshotNode >;
}

export type ScreenShotsTimeLine = {
	data: string;
	timing: number;
};

export default function CoreMetrics( {
	report,
	onRecommendationsFilterChange,
}: {
	report: PerformanceReport;
	onRecommendationsFilterChange: ( filter: Metrics ) => void;
} ) {
	const [ activeTab, setActiveTab ] = useState< Metrics >( 'overall_score' );
	const isDesktop = useViewportMatch( 'medium' );

	return (
		<Tabs
			orientation={ isDesktop ? 'vertical' : 'horizontal' }
			selectedTabId={ activeTab }
			onSelect={ ( tabId ) => setActiveTab( tabId as Metrics ) }
		>
			<Grid
				alignment="topLeft"
				columns={ isDesktop ? 2 : 1 }
				gap={ 6 }
				templateColumns={ isDesktop ? '220px 1fr' : '1fr' }
			>
				<CoreMetricsTabs compact={ ! isDesktop } report={ report } />
				<Tabs.TabPanel tabId={ activeTab }>
					<CoreMetricsContent
						report={ report }
						activeTab={ activeTab }
						onRecommendationsFilterChange={ onRecommendationsFilterChange }
					/>
				</Tabs.TabPanel>
			</Grid>
		</Tabs>
	);
}
