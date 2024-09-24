import { useDesktopBreakpoint } from '@automattic/viewport-react';
import clsx from 'clsx';
import { useState } from 'react';
import {
	Metrics,
	PerformanceMetricsHistory,
	PerformanceMetricsItemQueryResponse,
} from 'calypso/data/site-profiler/types';
import { CoreWebVitalsAccordion } from '../core-web-vitals-accordion';
import { CoreWebVitalsAccordionV2 } from '../core-web-vitals-accordion/core-web-vitals-accordion-v2';
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

	const MetricBar = props.showV2 ? MetricTabBarV2 : MetricTabBar;
	const CoreWebVitalsDetail = props.showV2 ? CoreWebVitalsDetailsV2 : CoreWebVitalsDetails;

	const Accordion = props.showV2 ? CoreWebVitalsAccordionV2 : CoreWebVitalsAccordion;

	return (
		<>
			{ isDesktop && (
				<div
					className={ clsx( 'core-web-vitals-display', {
						[ 'core-web-vitals-display-v2' ]: props.showV2,
					} ) }
				>
					<MetricBar
						activeTab={ activeTab ?? defaultTab }
						setActiveTab={ setActiveTab }
						{ ...props }
					/>
					<CoreWebVitalsDetail activeTab={ activeTab } { ...props } />
				</div>
			) }
			{ ! isDesktop && (
				<div className="core-web-vitals-display">
					<Accordion activeTab={ activeTab } setActiveTab={ setActiveTab } { ...props }>
						<CoreWebVitalsDetail activeTab={ activeTab } { ...props } />
					</Accordion>
				</div>
			) }
		</>
	);
};
