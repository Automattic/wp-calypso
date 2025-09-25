import {
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Card,
	CardBody,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useAnalytics } from '../../../app/analytics';
import { displayValue, getMetricsNames, mapThresholdsToStatus } from '../utils';
import PerformanceScore from './performance-score';
import { StatusIndicator } from './status-indicator';
import { Metrics } from './index';

type Props = Record< Metrics, number > & {
	activeTab: Metrics;
	setActiveTab: ( tab: Metrics ) => void;
};

const MetricTabBar = ( props: Props ) => {
	const { setActiveTab, overall } = props;
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
						<PerformanceScore score={ overall } size={ 48 } />
					</button>
				</CardBody>
			</Card>

			<Card>
				<CardBody>
					{ Object.entries( metricsNames ).map( ( [ key, { name: displayName } ] ) => {
						if ( props[ key as Metrics ] === undefined || props[ key as Metrics ] === null ) {
							return null;
						}

						// Only display TBT if INP is not available
						if ( key === 'tbt' && props[ 'inp' ] !== undefined && props[ 'inp' ] !== null ) {
							return null;
						}

						if ( key === 'overall' ) {
							return null;
						}

						const status = mapThresholdsToStatus( key as Metrics, props[ key as Metrics ] );
						const statusClassName = status === 'needsImprovement' ? 'needs-improvement' : status;

						return (
							<button key={ key } onClick={ () => handleTabClick( key as Metrics ) }>
								<div className="metric-tab-bar__tab-status">
									<StatusIndicator
										speed={ mapThresholdsToStatus( key as Metrics, props[ key as Metrics ] ) }
									/>
								</div>
								<div className="metric-tab-bar__tab-text">
									<div className="metric-tab-bar__tab-header">{ displayName }</div>
									<div className={ `metric-tab-bar__tab-metric ${ statusClassName }` }>
										{ displayValue( key as Metrics, props[ key as Metrics ] ) }
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

export default MetricTabBar;
