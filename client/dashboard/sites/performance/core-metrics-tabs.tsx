import {
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Card,
	CardBody,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useAnalytics } from '../../app/analytics';
import { displayValue, getMetricsNames, mapThresholdsToStatus } from './utils';

import { StatusIndicator } from './core-web-vitals/status-indicator';
import { Metrics } from './core-metrics';
import type { PerformanceReport } from '@automattic/api-core';

type Props = {
	report: PerformanceReport;
	activeTab: Metrics;
	setActiveTab: ( tab: Metrics ) => void;
};

const CoreMetricsTabs = ( props: Props ) => {
	const { report, setActiveTab } = props;
	const {
		overall_score,
		fcp,
		lcp,
		cls,
		inp,
		ttfb,
		tbt,
	} = report;

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
					<button onClick={ () => handleTabClick( 'overall' ) }>
					<Text>{ __( 'Performance Score' ) }</Text>
					{/* <PerformanceScore score={ metrics.overall } size={ 48 } /> */}
				</button>
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
						const statusClassName = status === 'needsImprovement' ? 'needs-improvement' : status;

						return (
							<button key={ key } onClick={ () => handleTabClick( key as Metrics ) }>
								<div className="metric-tab-bar__tab-status">
									<StatusIndicator
										speed={ mapThresholdsToStatus( key as Metrics, metrics[ key as Metrics ] ) }
									/>
								</div>
								<div className="metric-tab-bar__tab-text">
									<div className="metric-tab-bar__tab-header">{ displayName }</div>
									<div className={ `metric-tab-bar__tab-metric ${ statusClassName }` }>
										{ displayValue( key as Metrics, metrics[ key as Metrics ] ) }
									</div>
								</div>
							</button>
						);
					} ) }
				</CardBody>
			</Card>
		</VStack>
	);
};

export default CoreMetricsTabs;
