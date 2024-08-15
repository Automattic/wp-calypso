import { clsx } from 'clsx';
import { NewMetrics } from 'calypso/data/site-profiler/types';
import {
	metricsNames,
	mapThresholdsToStatus,
	displayValue,
} from 'calypso/performance-profiler/utils/metrics';
import { StatusIndicator } from '../status-indicator';
import './style.scss';

type Props = Record< NewMetrics, number > & {
	activeTab: NewMetrics;
	setActiveTab: ( tab: NewMetrics ) => void;
};

export const MetricTabBar = ( props: Props ) => {
	const { activeTab, setActiveTab } = props;

	return (
		<div className="metric-tab-bar">
			{ Object.entries( metricsNames ).map( ( [ key, { displayName } ] ) => (
				<button
					key={ key }
					className={ clsx( 'metric-tab-bar__tab', { active: key === activeTab } ) }
					onClick={ () => setActiveTab( key as NewMetrics ) }
				>
					<div className="metric-tab-bar__tab-status">
						<StatusIndicator
							speed={ mapThresholdsToStatus( key as NewMetrics, props[ key as NewMetrics ] ) }
						/>
					</div>
					<div className="metric-tab-bar__tab-text">
						<div className="metric-tab-bar__tab-header">{ displayName }</div>
						<div className="metric-tab-bar__tab-metric">
							{ displayValue( key as NewMetrics, props[ key as NewMetrics ] ) }
						</div>
					</div>
				</button>
			) ) }
		</div>
	);
};
