import { Metrics } from '@automattic/api-core';
import { __experimentalHStack as HStack, privateApis, Card, CardBody } from '@wordpress/components';
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
			<HStack wrap={ ! isDesktop } alignment="stretch" justify="flex-start" spacing={ 6 }>
				<Card style={ { flexGrow: ! isDesktop ? 1 : 0, flexShrink: ! isDesktop ? 1 : 0 } }>
					<CoreMetricsTabs compact={ ! isDesktop } report={ report } />
				</Card>
				<Card style={ { width: '100%' } }>
					<CardBody>
						<Tabs.TabPanel tabId={ activeTab }>
							<CoreMetricsContent
								report={ report }
								activeTab={ activeTab }
								onRecommendationsFilterChange={ onRecommendationsFilterChange }
							/>
						</Tabs.TabPanel>
					</CardBody>
				</Card>
			</HStack>
		</Tabs>
	);
}
