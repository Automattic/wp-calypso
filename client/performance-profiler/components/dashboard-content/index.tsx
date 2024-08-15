import { PerformanceReport } from 'calypso/data/site-profiler/types';
import { CoreWebVitalsDisplay } from 'calypso/performance-profiler/components/core-web-vitals-display';
import { InsightsSection } from 'calypso/performance-profiler/components/insights-section';
import { PerformanceScore } from 'calypso/performance-profiler/components/performance-score';
import './style.scss';

type PerformanceProfilerDashboardContentProps = {
	performanceReport: PerformanceReport;
};

export const PerformanceProfilerDashboardContent = ( {
	performanceReport,
}: PerformanceProfilerDashboardContentProps ) => {
	const { overall_score, fcp, lcp, cls, inp, ttfb, audits } = performanceReport;

	return (
		<div className="performance-profiler-content">
			<div className="l-block-wrapper container">
				<PerformanceScore value={ overall_score * 100 } />
				<CoreWebVitalsDisplay fcp={ fcp } lcp={ lcp } cls={ cls } inp={ inp } ttfb={ ttfb } />
				{ audits && <InsightsSection audits={ audits } /> }
			</div>
		</div>
	);
};
