import { useDesktopBreakpoint } from '@automattic/viewport-react';
import { useState } from 'react';
import {
	Metrics,
	PerformanceMetricsHistory,
	PerformanceMetricsItemQueryResponse,
} from 'calypso/data/site-profiler/types';
import { CoreWebVitalsAccordionV2 } from '../core-web-vitals-accordion/core-web-vitals-accordion-v2';
import MetricTabBarV2 from '../metric-tab-bar/metric-tab-bar-v2';
import { CoreWebVitalsDetailsV2 } from './core-web-vitals-details_v2';
import './style.scss';

type CoreWebVitalsDisplayProps = Record< Metrics, number > & {
	history: PerformanceMetricsHistory;
	audits: Record< string, PerformanceMetricsItemQueryResponse >;
	recommendationsRef: React.RefObject< HTMLDivElement > | null;
	overallScoreIsTab?: boolean;
	onRecommendationsFilterChange?: ( filter: string ) => void;
};

export const CoreWebVitalsDisplay = ( props: CoreWebVitalsDisplayProps ) => {
	const defaultTab = props.overallScoreIsTab ? 'overall' : 'fcp';
	const [ activeTab, setActiveTab ] = useState< Metrics | null >( defaultTab );
	const isDesktop = useDesktopBreakpoint();

	if ( isDesktop ) {
		return (
			<div className="core-web-vitals-display core-web-vitals-display-v2">
				<MetricTabBarV2
					activeTab={ activeTab ?? defaultTab }
					setActiveTab={ setActiveTab }
					showOverall={ props.overallScoreIsTab }
					{ ...props }
				/>
				<CoreWebVitalsDetailsV2 activeTab={ activeTab } { ...props } />
			</div>
		);
	}

	return (
		<div className="core-web-vitals-display">
			<CoreWebVitalsAccordionV2
				activeTab={ activeTab }
				setActiveTab={ setActiveTab }
				showOverall={ props.overallScoreIsTab }
				{ ...props }
			>
				<CoreWebVitalsDetailsV2 activeTab={ activeTab } { ...props } />
			</CoreWebVitalsAccordionV2>
		</div>
	);
};
