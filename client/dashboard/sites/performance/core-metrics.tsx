import { Metrics } from '@automattic/api-core';
import { __experimentalGrid as Grid, privateApis } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __dangerousOptInToUnstableAPIsOnlyForCoreModules } from '@wordpress/private-apis';
import { useState } from 'react';
import CoreMetricsContent from './core-metrics-content';
import CoreMetricsTabs from './core-metrics-tabs';
import type { SitePerformanceReport } from '@automattic/api-core';

const { unlock } = __dangerousOptInToUnstableAPIsOnlyForCoreModules(
	'I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.',
	'@wordpress/components'
);

const { Tabs } = unlock( privateApis );

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
			onSelect={ ( tabId: Metrics ) => setActiveTab( tabId ) }
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
