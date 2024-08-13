import { TabType } from 'calypso/performance-profiler/components/header';
import { PerformanceScore } from 'calypso/performance-profiler/components/performance-score';
import './style.scss';

type PerformanceProfilerDashboardContentProps = {
	activeTab: TabType;
};

export const PerformanceProfilerDashboardContent = (
	props: PerformanceProfilerDashboardContentProps
) => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { activeTab } = props;

	return (
		<div className="performance-profiler-content">
			<div className="l-block-wrapper">
				<PerformanceScore value={ 70 } />
			</div>
		</div>
	);
};
