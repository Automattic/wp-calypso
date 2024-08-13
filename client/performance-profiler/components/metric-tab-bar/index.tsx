import { clsx } from 'clsx';
import { PerformanceMetrics } from 'calypso/performance-profiler/types/performance-metrics';
import { metricsNames, mapThresholdsToStatus } from 'calypso/performance-profiler/utils/metrics';
import { StatusIndicator } from '../status-indicator';
import './style.scss';

type Props = PerformanceMetrics & {
	activeTab: string;
	setActiveTab: ( tab: string ) => void;
};

const displayValue = ( metric: keyof PerformanceMetrics, value: number ): string => {
	if ( [ 'lcp', 'fcp', 'ttfb' ].includes( metric ) ) {
		return `${ ( value / 1000 ).toFixed( 2 ) } s`;
	}

	if ( [ 'inp', 'fid' ].includes( metric ) ) {
		return `${ value } ms`;
	}

	return `${ value }`;
};

export const MetricTabBar = ( props: Props ) => {
	const { activeTab, setActiveTab } = props;

	return (
		<div className="metric-tab-bar">
			{ Object.entries( metricsNames ).map( ( [ key, name ] ) => (
				<button
					key={ key }
					className={ clsx( 'metric-tab-bar__tab', { active: key === activeTab } ) }
					onClick={ () => setActiveTab( key ) }
				>
					<div className="metric-tab-bar__tab-status">
						<StatusIndicator
							speed={ mapThresholdsToStatus(
								key as keyof PerformanceMetrics,
								props[ key as keyof PerformanceMetrics ]
							) }
						/>
					</div>
					<div className="metric-tab-bar__tab-text">
						<div className="metric-tab-bar__tab-header">{ name }</div>
						<div className="metric-tab-bar__tab-metric">
							{ displayValue(
								key as keyof PerformanceMetrics,
								props[ key as keyof PerformanceMetrics ]
							) }
						</div>
					</div>
				</button>
			) ) }
		</div>
	);
};
