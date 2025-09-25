import { useViewportMatch } from '@wordpress/compose';
import { useState } from 'react';
import { CoreWebVitalsAccordion } from './core-web-vitals-accordion';
import { CoreWebVitalsDetails } from './core-web-vitals-details';
import MetricTabBar from './metric-tab-bar';

// Types moved from calypso/data/site-profiler/types
export type Metrics = 'cls' | 'lcp' | 'fcp' | 'ttfb' | 'inp' | 'tbt' | 'overall';

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

type CoreWebVitalsDisplayProps = Record< Metrics, number > & {
	history: PerformanceMetricsHistory;
	audits: Record< string, PerformanceMetricsItemQueryResponse >;
	recommendationsRef: React.RefObject< HTMLDivElement > | null;
	onRecommendationsFilterChange?: ( filter: string ) => void;
};

export const CoreWebVitalsDisplay = ( props: CoreWebVitalsDisplayProps ) => {
	const [ activeTab, setActiveTab ] = useState< Metrics | null >( 'overall' );
	const isDesktop = useViewportMatch( 'medium' );

	if ( isDesktop ) {
		return (
			<>
				<MetricTabBar activeTab={ activeTab } setActiveTab={ setActiveTab } { ...props } />
				<CoreWebVitalsDetails activeTab={ activeTab } { ...props } />
			</>
		);
	}

	return (
		<CoreWebVitalsAccordion activeTab={ activeTab } setActiveTab={ setActiveTab } { ...props }>
			<CoreWebVitalsDetails activeTab={ activeTab } { ...props } />
		</CoreWebVitalsAccordion>
	);
};
