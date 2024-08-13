import { TabType } from 'calypso/performance-profiler/components/header';
import { PerformanceScore } from 'calypso/performance-profiler/components/performance-score';
import './style.scss';
import { CoreWebVitalsDisplay } from '../core-web-vitals-display';

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
				<CoreWebVitalsDisplay lcp={ 1966 } cls={ 0.01 } fcp={ 1794 } ttfb={ 916 } inp={ 391 } />
			</div>
		</div>
	);
};
