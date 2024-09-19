import { clsx } from 'clsx';
import { Metrics } from 'calypso/data/site-profiler/types';
import { CircularPerformanceScore } from 'calypso/hosting/performance/components/circular-performance-score/circular-performance-score';
import {
	metricsNames,
	mapThresholdsToStatus,
	displayValue,
} from 'calypso/performance-profiler/utils/metrics';
import { StatusIndicator } from '../status-indicator';
import './style_v2.scss';

type Props = Record< Metrics, number > & {
	activeTab: Metrics;
	setActiveTab: ( tab: Metrics ) => void;
};

const MetricTabBarV2 = ( props: Props ) => {
	const { activeTab, setActiveTab } = props;

	return (
		<div className="metric-tab-bar">
			<button
				className={ clsx( 'metric-tab-bar__tab metric-tab-bar__performance', {
					active: activeTab === 'overall',
				} ) }
				onClick={ () => setActiveTab( 'overall' ) }
			>
				<div className="metric-tab-bar__tab-text">
					<div className="metric-tab-bar__tab-header">Performance Score</div>
					<div className="metric-tab-bar__tab-metric">
						<CircularPerformanceScore score={ props.overall } size={ 48 } />
					</div>
				</div>
			</button>
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
					<button
						key={ key }
						className={ clsx( 'metric-tab-bar__tab', { active: key === activeTab } ) }
						onClick={ () => setActiveTab( key as Metrics ) }
					>
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
		</div>
	);
};

export default MetricTabBarV2;
