import { Metrics } from '@automattic/api-core';
import { Tabs } from '@automattic/components/src/tabs';
import { __experimentalGrid as Grid } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { useState } from 'react';
import CoreMetricsContent from './core-metrics-content';
import CoreMetricsTabs from './core-metrics-tabs';
import type { SitePerformanceReport } from '@automattic/api-core';

export default function CoreMetrics( {
	report,
	onRecommendationsFilterChange,
}: {
	report: SitePerformanceReport;
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
