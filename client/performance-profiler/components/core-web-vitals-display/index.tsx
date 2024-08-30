import { useDesktopBreakpoint } from '@automattic/viewport-react';
import { useState } from 'react';
import { Metrics, PerformanceMetricsHistory } from 'calypso/data/site-profiler/types';
import { CoreWebVitalsAccordion } from '../core-web-vitals-accordion';
import { MetricTabBar } from '../metric-tab-bar';
import { CoreWebVitalsDetails } from './core-web-vitals-details';

import './style.scss';

type CoreWebVitalsDisplayProps = Record< Metrics, number > & {
	history: PerformanceMetricsHistory;
};

export const CoreWebVitalsDisplay = ( props: CoreWebVitalsDisplayProps ) => {
	const defaultTab = 'fcp';
	const [ activeTab, setActiveTab ] = useState< Metrics | null >( defaultTab );
	const isDesktop = useDesktopBreakpoint();

	return (
		<>
			{ isDesktop && (
				<div className="core-web-vitals-display">
					<MetricTabBar
						activeTab={ activeTab ?? defaultTab }
						setActiveTab={ setActiveTab }
						{ ...props }
					/>
					<CoreWebVitalsDetails activeTab={ activeTab } { ...props } />
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
