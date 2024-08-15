import { Metrics, PerformanceReport } from 'calypso/data/site-profiler/types';
import HistoryChart from 'calypso/performance-profiler/components/charts/history-chart';
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

	// ttfb range
	const valueRanges = {
		ttfb: [ 0.8, 1.8 ],
		fcp: [ 1.8, 3 ],
		lcp: [ 2.5, 4 ],
		cls: [ 0.1, 0.25 ],
		inp: [ 200, 500 ],
	};

	const renderHistoricalChart = ( report: PerformanceReport, metric: Metrics ) => {
		let metrics = report?.history?.metrics[ metric ] ?? [];
		let dates = report?.history?.collection_period ?? [];

		// last 8 weeks only
		metrics = metrics.slice( -8 );
		dates = dates.slice( -8 );

		const data = metrics.map( ( item, index ) => {
			return {
				date: '2024/' + dates[ index ],
				value: item,
			};
		} );

		return (
			<HistoryChart data={ data } range={ valueRanges[ metric ] } width={ 600 } height={ 300 } />
		);
	};

	return (
		<div className="performance-profiler-content">
			<div className="l-block-wrapper container">
				<PerformanceScore value={ overall_score * 100 } />
				<CoreWebVitalsDisplay fcp={ fcp } lcp={ lcp } cls={ cls } inp={ inp } ttfb={ ttfb } />
				{ audits && <InsightsSection audits={ audits } /> }
				{ renderHistoricalChart( performanceReport, 'cls' ) }
			</div>
		</div>
	);
};
