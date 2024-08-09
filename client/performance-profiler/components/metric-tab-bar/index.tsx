import { PerformanceMetrics } from 'calypso/performance-profiler/types/performance-metrics';
import './style.scss';
import { StatusIndicator } from '../status-indicator';

type Props = PerformanceMetrics & {
	activeTab: string;
	setActiveTab: ( tab: string ) => void;
};

export const MetricTabBar = ( { activeTab }: Props ) => {
	return (
		<div className="metric-tab-bar">
			<div className="metric-tab-bar__tab">
				<div className="metric-tab-bar__tab-status">
					<StatusIndicator speed="fast" />
				</div>
				<div className="metric-tab-bar__tab-text">
					<div className="metric-tab-bar__tab-header">Loading speed</div>
					<div className="metric-tab-bar__tab-metric">2.4</div>
				</div>
			</div>
		</div>
	);
};
