import {
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Button,
	Card,
	CardBody,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useAnalytics } from '../../app/analytics';
import { getMetricsNames, mapThresholdsToStatus } from './utils';
import { Metrics } from './core-metrics';
import type { PerformanceReport } from '@automattic/api-core';
import { OverallScore, MetricScore } from './core-metrics-score';

const TabButton = ( { children, onClick }: { children: React.ReactNode; onClick: () => void } ) => {
	return (
		<Button
			style={ { height: 'unset', width: '100%', paddingTop: '8px', paddingBottom: '8px' } }
			onClick={ onClick }
		>
			<VStack alignment="flex-start" spacing={ 0 }>
				{ children }
			</VStack>
		</Button>
	);
};

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
		<VStack spacing={ 6 }>
			<Card>
				<TabButton onClick={ () => handleTabClick( 'overall' ) }>
					<Text size={ 11 } lineHeight="24px" upperCase variant="muted">
						{ __( 'Performance Score' ) }
					</Text>
					<OverallScore
						lineHeight="32px"
						metric={ 'overall' }
						status={ mapThresholdsToStatus( 'overall', metrics.overall ) }
						value={ metrics.overall }
					/>
				</TabButton>
			</Card>
			<Card>
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
						<TabButton onClick={ () => handleTabClick( key as Metrics ) }>
							<Text size={ 11 } lineHeight="24px" upperCase variant="muted">
								{ displayName }
							</Text>
							<MetricScore
								lineHeight="32px"
								metric={ key as Metrics }
								status={ status }
								value={ metrics[ key as Metrics ] }
							/>
						</TabButton>
					);
				} ) }
			</Card>
		</VStack>
	);
};

export default CoreMetricsTabs;
