import { Metrics } from '@automattic/api-core';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { Text } from '../../components/text';
import {
	metricsNames,
	mapThresholdsToStatus,
	metricsThresholds,
} from '../../utils/site-performance';
import CoreMetricsChart from './core-metrics-chart';
import CoreMetricsExplanation from './core-metrics-explanation';
import { CoreMetricsRecommendLink } from './core-metrics-recommend-link';
import { MetricScore } from './core-metrics-score';
import { CoreMetricsStatusBadge } from './core-metrics-status-badge';
import { filterRecommendations } from './performance-insights';
import type { SitePerformanceReport } from '@automattic/api-core';

export default function CoreMetricsContent( {
	report,
	activeTab,
	onRecommendationsFilterChange,
}: {
	report: SitePerformanceReport;
	activeTab: Metrics;
	onRecommendationsFilterChange: ( filter: Metrics ) => void;
} ) {
	const { audits } = report;
	const { name: displayName } = metricsNames[ activeTab ];

	const numberOfAuditsForMetric = Object.keys( audits ).filter( ( key ) =>
		filterRecommendations( activeTab, audits[ key ] )
	).length;

	const value = report[ activeTab ];
	const status = mapThresholdsToStatus( activeTab as Metrics, value );

	return (
		<VStack spacing={ 4 }>
			<HStack wrap spacing={ 4 } justify="space-between" alignment="flex-start">
				<VStack spacing={ 4 } alignment="flex-start">
					<HStack spacing={ 2 } justify="flex-start">
						<Text size="title" weight={ 500 } as="h2">
							{ displayName }
						</Text>
						<CoreMetricsStatusBadge value={ status } />
					</HStack>

					<MetricScore
						size={ 32 }
						metric={ activeTab as Metrics }
						status={ status }
						value={ value }
					/>

					<CoreMetricsExplanation activeTab={ activeTab } />
				</VStack>
				{ numberOfAuditsForMetric > 0 && (
					<CoreMetricsRecommendLink
						activeTab={ activeTab }
						count={ numberOfAuditsForMetric }
						onClick={ onRecommendationsFilterChange }
					/>
				) }
			</HStack>
			<CoreMetricsChart
				report={ report }
				metric={ activeTab }
				metricsThresholds={ metricsThresholds }
			/>
		</VStack>
	);
}
