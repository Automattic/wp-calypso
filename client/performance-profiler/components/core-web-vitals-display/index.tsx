import { useDesktopBreakpoint } from '@automattic/viewport-react';
import clsx from 'clsx';
import { useState } from 'react';
import {
	Metrics,
	PerformanceMetricsHistory,
	PerformanceMetricsItemQueryResponse,
} from 'calypso/data/site-profiler/types';
import { CoreWebVitalsAccordion } from '../core-web-vitals-accordion';
import { MetricTabBar } from '../metric-tab-bar';
import MetricTabBarV2 from '../metric-tab-bar/metric-tab-bar-v2';
import { CoreWebVitalsDetails } from './core-web-vitals-details';
import { CoreWebVitalsDetailsV2 } from './core-web-vitals-details_v2';
import './style.scss';

type CoreWebVitalsDisplayProps = Record< Metrics, number > & {
	history: PerformanceMetricsHistory;
	audits: Record< string, PerformanceMetricsItemQueryResponse >;
	recommendationsRef: React.RefObject< HTMLDivElement > | null;
	showV2?: boolean;
	onRecommendationsFilterChange?: ( filter: string ) => void;
};

export const CoreWebVitalsDisplay = ( props: CoreWebVitalsDisplayProps ) => {
	const defaultTab = props.showV2 ? 'overall' : 'fcp';
	const [ activeTab, setActiveTab ] = useState< Metrics | null >( defaultTab );
	const isDesktop = useDesktopBreakpoint();

	const details = props.showV2 ? (
		<CoreWebVitalsDetailsV2 activeTab={ activeTab } { ...props } />
	) : (
		<CoreWebVitalsDetails activeTab={ activeTab } { ...props } />
	);

	const metricTabBar = props.showV2 ? (
		<MetricTabBarV2
			activeTab={ activeTab ?? defaultTab }
			setActiveTab={ setActiveTab }
			{ ...props }
		/>
	) : (
		<MetricTabBar
			activeTab={ activeTab ?? defaultTab }
			setActiveTab={ setActiveTab }
			{ ...props }
		/>
	);

	return (
		<>
			{ isDesktop && (
				<div
					className={ clsx( 'core-web-vitals-display', {
						[ 'core-web-vitals-display-v2' ]: props.showV2,
					} ) }
				>
					{ metricTabBar }
					{ details }
				</div>
			) }
			{ ! isDesktop && (
				<div className="core-web-vitals-display">
					<CoreWebVitalsAccordion
						activeTab={ activeTab }
						setActiveTab={ setActiveTab }
						{ ...props }
					>
						<CoreWebVitalsDetails activeTab={ activeTab } { ...props } />
					</CoreWebVitalsAccordion>
				</div>
			) }
		</>
	);
};
