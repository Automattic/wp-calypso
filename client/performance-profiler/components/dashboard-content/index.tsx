import { PerformanceReport } from 'calypso/data/site-profiler/types';
import HistoryChart from 'calypso/performance-profiler/components/charts/history-chart';
import { PerformanceScore } from 'calypso/performance-profiler/components/performance-score';
import './style.scss';

type PerformanceProfilerDashboardContentProps = {
	performanceReport?: PerformanceReport;
};

export const PerformanceProfilerDashboardContent = (
	props: PerformanceProfilerDashboardContentProps
) => {
	const { performanceReport } = props;

	// ttfb range
	const valueRanges = {
		ttfb: [ 0.8, 1.8 ],
		fcp: [ 1.8, 3 ],
		lcp: [ 2.5, 4 ],
		cls: [ 0.1, 0.25 ],
		inp: [ 200, 500 ],
	};

	const renderHistoricalChart = ( report: PerformanceReport, metric: string ) => {
		const metrics = report?.history?.metrics[ metric ] ?? [];
		const data = metrics.map( ( item, index ) => {
			return {
				date: '2024/' + report?.history?.collection_period[ index ],
				value: item ?? 0,
			};
		} );

		return (
			<HistoryChart data={ data } range={ valueRanges[ metric ] } width={ 600 } height={ 300 } />
		);
	};

	return (
		<div className="performance-profiler-content">
			<div className="l-block-wrapper">
				{ performanceReport?.overall_score && (
					<PerformanceScore value={ performanceReport.overall_score * 100 } />
				) }

				{ renderHistoricalChart( performanceReport, 'cls' ) }
			</div>
		</div>
	);
};
