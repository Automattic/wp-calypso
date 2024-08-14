import { PerformanceReport } from 'calypso/data/site-profiler/types';
import { PerformanceScore } from 'calypso/performance-profiler/components/performance-score';
import './style.scss';
import { CoreWebVitalsDisplay } from '../core-web-vitals-display';

type PerformanceProfilerDashboardContentProps = {
	performanceReport?: PerformanceReport;
};

export const PerformanceProfilerDashboardContent = (
	props: PerformanceProfilerDashboardContentProps
) => {
	const { performanceReport } = props;

	return (
		<div className="performance-profiler-content">
			<div className="l-block-wrapper">
				{ performanceReport?.overall_score && (
					<>
						<PerformanceScore value={ performanceReport.overall_score * 100 } />
						<CoreWebVitalsDisplay fcp={ 1794 } lcp={ 1966 } cls={ 0.05 } inp={ 391 } ttfb={ 916 } />
					</>
				) }
			</div>
		</div>
	);
};
