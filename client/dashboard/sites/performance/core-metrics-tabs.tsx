import {
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Button,
	Card,
	CardBody,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useAnalytics } from '../../app/analytics';
import { displayValue, getMetricsNames, mapThresholdsToStatus } from './utils';

import { StatusIndicator } from './core-web-vitals/status-indicator';
import { Metrics } from './core-metrics';
import type { PerformanceReport } from '@automattic/api-core';
import { OverallScore, MetricScore } from './core-metrics-score';

const CoreMetricsTabs = ( {
	report,
	setActiveTab,
}: {
	report: PerformanceReport;
	setActiveTab: ( tab: Metrics ) => void;
} ) => {
	const { overall_score, fcp, lcp, cls, inp, ttfb, tbt } = report;

	const metrics = {
		fcp,
		lcp,
		cls,
		inp,
		ttfb,
		tbt,
		overall: overall_score * 100,
	};
	const { recordTracksEvent } = useAnalytics();
	const handleTabClick = ( tab: Metrics ) => {
		setActiveTab( tab );
		recordTracksEvent( 'calypso_performance_profiler_metric_tab_click', {
			tab,
		} );
	};

	const metricsNames = getMetricsNames();

	return (
		<VStack spacing={ 4 }>
			<Card>
				<CardBody>
					<Button onClick={ () => handleTabClick( 'overall' ) }>
					<VStack justify="flex-start">
						<Text size={ 11 } upperCase variant="muted">{ __( 'Performance Score' ) }</Text>
						<OverallScore
							metric={ 'overall' }
							status={ mapThresholdsToStatus( 'overall', metrics.overall ) }
							value={ metrics.overall }
						/>
					</VStack>
					</Button>
				</CardBody>
			</Card>

			<Card>
				<CardBody>
					{ Object.entries( metricsNames ).map( ( [ key, { name: displayName } ] ) => {
						if ( metrics[ key as Metrics ] === undefined || metrics[ key as Metrics ] === null ) {
							return null;
						}

						// Only display TBT if INP is not available
						if ( key === 'tbt' && metrics[ 'inp' ] !== undefined && metrics[ 'inp' ] !== null ) {
							return null;
						}

						if ( key === 'overall' ) {
							return null;
						}

						const status = mapThresholdsToStatus( key as Metrics, metrics[ key as Metrics ] );

						return (
							<Button key={ key } onClick={ () => handleTabClick( key as Metrics ) }>
								<div className="metric-tab-bar__tab-status">
									<StatusIndicator
										speed={ mapThresholdsToStatus( key as Metrics, metrics[ key as Metrics ] ) }
									/>
								</div>
								<VStack justify="flex-start">
									<Text size={ 11 } upperCase variant="muted">
										{ displayName }
									</Text>
									<MetricScore metric={ key as Metrics } status={ status } value={ metrics[ key as Metrics ] } />
								</VStack>
							</Button>
						);
					} ) }
				</CardBody>
			</Card>
		</VStack>
	);
};

export default CoreMetricsTabs;
