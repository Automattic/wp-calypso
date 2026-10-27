import { useDesktopBreakpoint } from '@automattic/viewport-react';
import { useState } from 'react';
import { Metrics, PerformanceMetricsHistory } from 'calypso/data/site-profiler/types';
import { CoreWebVitalsAccordion } from '../core-web-vitals-accordion';
import MetricTabBar from '../metric-tab-bar';
import { CoreWebVitalsDetails } from './core-web-vitals-details';
import type { PerformanceMetricAudit } from '@automattic/api-core';
import './style.scss';

type CoreWebVitalsDisplayProps = Record< Metrics, number > & {
	history: PerformanceMetricsHistory;
	audits: Record< string, PerformanceMetricAudit >;
	recommendationsRef: React.RefObject< HTMLDivElement | null > | null;
	onRecommendationsFilterChange?: ( filter: string ) => void;
};

export const CoreWebVitalsDisplay = ( props: CoreWebVitalsDisplayProps ) => {
	const [ activeTab, setActiveTab ] = useState< Metrics | null >( 'overall' );
	const isDesktop = useDesktopBreakpoint();

	if ( isDesktop ) {
		return (
			<div className="core-web-vitals-display is-desktop">
				<MetricTabBar
					activeTab={ activeTab ?? 'overall' }
					setActiveTab={ setActiveTab }
					{ ...props }
				/>
				<CoreWebVitalsDetails activeTab={ activeTab } { ...props } />
			</div>
		);
	}

	return (
		<div className="core-web-vitals-display">
			<CoreWebVitalsAccordion activeTab={ activeTab } setActiveTab={ setActiveTab } { ...props }>
				<CoreWebVitalsDetails activeTab={ activeTab } { ...props } />
			</CoreWebVitalsAccordion>
		</div>
	);
};
