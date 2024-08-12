import {
	PerformanceMetrics,
	Valuation,
} from 'calypso/performance-profiler/types/performance-metrics';
import { metricsTresholds, metricsNames } from 'calypso/performance-profiler/utils/metrics';
import './style.scss';
import { StatusIndicator } from '../status-indicator';

type Props = PerformanceMetrics & {
	activeTab: string;
	setActiveTab: ( tab: string ) => void;
};

const mapThresholdsToStatus = ( metric: keyof PerformanceMetrics, value: number ): Valuation => {
	const { good, needsImprovement } = metricsTresholds[ metric ];

	if ( value <= good ) {
		return 'good';
	}

	if ( value <= needsImprovement ) {
		return 'needsImprovement';
	}

	return 'bad';
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
	return (
		<div className="metric-tab-bar">
			{ Object.entries( metricsNames ).map( ( [ key, name ] ) => (
				<div key={ key } className="metric-tab-bar__tab">
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
				</div>
			) ) }
		</div>
	);
};
