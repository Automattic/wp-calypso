import { Tabs } from '@automattic/components/src/tabs';
import {
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Card,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { OverallScore, MetricScore } from './core-metrics-score';
import { metricsNames, mapThresholdsToStatus, Metrics } from './utils';
import type { PerformanceReport } from '@automattic/api-core';

const Tab = ( { children, tabId }: { children: React.ReactNode; tabId: string } ) => {
	const isDesktop = useViewportMatch( 'medium' );

	return (
		<Tabs.Tab tabId={ tabId } style={ { height: '100%' } }>
			<VStack alignment={ isDesktop ? 'flex-start' : 'center' } spacing={ 0 }>
				{ children }
			</VStack>
		</Tabs.Tab>
	);
};

const CoreMetricsTabs = ( {
	report,
	compact,
}: {
	report: PerformanceReport;
	compact?: boolean;
} ) => {
	const isSmall = useViewportMatch( 'small' );

	return (
		<Card>
			<Tabs.TabList>
				<Tab tabId="overall_score">
					<Text size={ 11 } lineHeight="24px" upperCase variant="muted">
						{ compact ? metricsNames.overall_score.shortName : metricsNames.overall_score.name }
					</Text>
					<OverallScore
						lineHeight="32px"
						status={ mapThresholdsToStatus( 'overall_score', report.overall_score ) }
						size={ isSmall ? 20 : 16 }
						value={ report.overall_score }
					/>
				</Tab>
				{ Object.entries( metricsNames ).map(
					( [ key, { name: displayName, shortName: shortDisplayName } ] ) => {
						// Overall score is displayed in the first card
						if ( key === 'overall_score' ) {
							return null;
						}

						if (
							report[ key as keyof PerformanceReport ] === undefined ||
							report[ key as keyof PerformanceReport ] === null
						) {
							return null;
						}

						// Only display TBT if INP is not available
						if ( key === 'tbt' && report[ 'inp' ] !== undefined && report[ 'inp' ] !== null ) {
							return null;
						}

						const status = mapThresholdsToStatus( key as Metrics, report[ key as Metrics ] );
						const metricKey = key as Metrics;

						return (
							<Tab key={ key } tabId={ metricKey }>
								<Text size={ 11 } lineHeight="24px" upperCase variant="muted">
									{ compact ? shortDisplayName : displayName }
								</Text>
								<MetricScore
									lineHeight="32px"
									metric={ metricKey }
									status={ status }
									size={ isSmall ? 20 : 16 }
									value={ report[ metricKey ] }
								/>
							</Tab>
						);
					}
				) }
			</Tabs.TabList>
		</Card>
	);
};

export default CoreMetricsTabs;
