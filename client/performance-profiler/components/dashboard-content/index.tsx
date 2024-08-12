import { TabType } from 'calypso/performance-profiler/components/header';
import './style.scss';

type PerformanceProfilerDashboardContentProps = {
	activeTab: TabType;
};

export const PerformanceProfilerDashboardContent = (
	props: PerformanceProfilerDashboardContentProps
) => {
	const { activeTab } = props;

	return (
		<div className="performance-profiler-content">
			<div className="l-block-wrapper">Dashboard content { activeTab }</div>
		</div>
	);
};
