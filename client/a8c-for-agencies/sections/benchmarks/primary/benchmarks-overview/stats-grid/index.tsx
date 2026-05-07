import useFetchAgencyBenchmarksList from '../../../hooks/use-fetch-agency-benchmarks-list';
import useFetchBenchmarksAggregates from '../../../hooks/use-fetch-benchmarks-aggregates';
import StatCard from './stat-card';
import { getStatCardConfigs } from './stat-card-config';
import type { TrendPoint } from './stat-trend-chart';
import type { AgencyBenchmark, Quarter } from '../../../constants';

import './style.scss';

const TREND_QUARTERS = 6;

function buildTrendPoints(
	submissions: AgencyBenchmark[],
	getValue: ( s: AgencyBenchmark ) => number | undefined
): TrendPoint[] {
	// `submissions` is year-desc, quarter-desc; trend chart wants chronological order.
	const lastSix = submissions.slice( 0, TREND_QUARTERS ).reverse();
	const points: TrendPoint[] = [];
	for ( const submission of lastSix ) {
		const value = getValue( submission );
		if ( value === undefined ) {
			continue;
		}
		points.push( {
			quarter: { quarter: submission.quarter as Quarter[ 'quarter' ], year: submission.year },
			value,
		} );
	}
	return points;
}

export default function BenchmarkStatsGrid() {
	const { data: submissions, isLoading: isListLoading } = useFetchAgencyBenchmarksList();
	const { data: aggregates, isLoading: isAggregatesLoading } = useFetchBenchmarksAggregates();

	if ( isListLoading || isAggregatesLoading ) {
		return null;
	}
	if ( ! submissions || submissions.length === 0 ) {
		return null;
	}

	const latest = submissions[ 0 ];
	const previous = submissions[ 1 ];
	const previousQuarter: Quarter | undefined = previous
		? { quarter: previous.quarter as Quarter[ 'quarter' ], year: previous.year }
		: undefined;

	const aggregateRow = aggregates?.find(
		( row ) => row.quarter === latest.quarter && row.year === latest.year
	);

	const configs = getStatCardConfigs();

	return (
		<div className="benchmarks-stats-grid">
			{ configs.map( ( config ) => {
				const currentValue = config.getSubmissionValue( latest );
				if ( currentValue === undefined ) {
					return null;
				}
				const previousValue = previous ? config.getSubmissionValue( previous ) : undefined;
				const metricSummary = aggregateRow?.metrics[ config.metricKey ];
				const trendPoints = buildTrendPoints( submissions, config.getSubmissionValue );

				return (
					<StatCard
						key={ config.metricKey }
						config={ config }
						currentValue={ currentValue }
						previousValue={ previousValue }
						previousQuarter={ previousQuarter }
						metricSummary={ metricSummary }
						sampleSize={ aggregateRow?.sample_size }
						trendPoints={ trendPoints }
					/>
				);
			} ) }
		</div>
	);
}
