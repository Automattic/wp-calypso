import { useDesktopBreakpoint } from '@automattic/viewport-react';
import { useState } from 'react';
import {
	Metrics,
	PerformanceMetricsHistory,
	PerformanceMetricsItemQueryResponse,
} from 'calypso/data/site-profiler/types';
import { CoreWebVitalsAccordion } from '../core-web-vitals-accordion';
import MetricTabBar from '../metric-tab-bar';
import { CoreWebVitalsDetails } from './core-web-vitals-details';
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
			<div className="core-web-vitals-display is-desktop">
				<MetricTabBar
					activeTab={ activeTab ?? defaultTab }
					setActiveTab={ setActiveTab }
					showOverall={ props.overallScoreIsTab }
					{ ...props }
				/>
				<CoreWebVitalsDetails activeTab={ activeTab } { ...props } />
			</div>
		);
	}

	return (
		<div className="core-web-vitals-display">
			<CoreWebVitalsAccordion
				activeTab={ activeTab }
				setActiveTab={ setActiveTab }
				showOverall={ props.overallScoreIsTab }
				{ ...props }
			>
				<CoreWebVitalsDetails activeTab={ activeTab } { ...props } />
			</CoreWebVitalsAccordion>
		</div>
	);
};
