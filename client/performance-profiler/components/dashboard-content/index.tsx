import { PerformanceReport } from 'calypso/data/site-profiler/types';
import { PerformanceScore } from 'calypso/performance-profiler/components/performance-score';
import './style.scss';
import { CoreWebVitalsDisplay } from '../core-web-vitals-display';

type PerformanceProfilerDashboardContentProps = {
	performanceReport: PerformanceReport;
};

export const PerformanceProfilerDashboardContent = ( {
	performanceReport,
}: PerformanceProfilerDashboardContentProps ) => {
	const { overall_score, fcp, lcp, cls, inp, ttfb } = performanceReport;

	return (
		<div className="performance-profiler-content">
			<div className="l-block-wrapper">
				{ overall_score && (
					<>
						<PerformanceScore value={ overall_score * 100 } />
						<CoreWebVitalsDisplay fcp={ fcp } lcp={ lcp } cls={ cls } inp={ inp } ttfb={ ttfb } />
					</>
				) }
			</div>
		</div>
	);
};
