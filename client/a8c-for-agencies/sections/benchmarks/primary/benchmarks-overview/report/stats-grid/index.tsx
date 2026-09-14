import useFetchAgencyBenchmarksList from '../../../../hooks/use-fetch-agency-benchmarks-list';
import useFetchBenchmarksAggregates from '../../../../hooks/use-fetch-benchmarks-aggregates';
import StatCard from './stat-card';
import { getStatCardConfigs } from './stat-card-config';
import type { TrendPoint } from './stat-trend-chart';
import type {
	AgencyBenchmark,
	AggregateMetricKey,
	MetricSummary,
	Quarter,
} from '../../../../constants';

import './style.scss';

const TREND_QUARTERS = 6;

type Props = {
	quarter: Quarter[ 'quarter' ];
	year: Quarter[ 'year' ];
	// When a peer filter is active, the parent recomputes the per-metric summaries from the
	// filtered `/peers` rows and passes them here in place of the unfiltered `/aggregates` data.
	// `isFiltered` with no `metricSummaries` means the filtered pool is empty — show "no peer data".
	metricSummaries?: Record< AggregateMetricKey, MetricSummary >;
	sampleSizeOverride?: number;
	isFiltered?: boolean;
};

function buildTrendPoints(
	submissions: AgencyBenchmark[],
	startIndex: number,
	getValue: ( s: AgencyBenchmark ) => number | undefined
): TrendPoint[] {
	// `submissions` is year-desc, quarter-desc; take up to TREND_QUARTERS ending at the
	// active quarter, then reverse into the chronological order the trend chart wants.
	const window = submissions.slice( startIndex, startIndex + TREND_QUARTERS ).reverse();
	const points: TrendPoint[] = [];
	for ( const submission of window ) {
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

export default function BenchmarkStatsGrid( {
	quarter,
	year,
	metricSummaries,
	sampleSizeOverride,
	isFiltered,
}: Props ) {
	const { data: submissions, isLoading: isListLoading } = useFetchAgencyBenchmarksList();
	const { data: aggregates, isLoading: isAggregatesLoading } = useFetchBenchmarksAggregates();

	if ( isListLoading || isAggregatesLoading ) {
		return null;
	}
	if ( ! submissions || submissions.length === 0 ) {
		return null;
	}

	const activeIndex = submissions.findIndex( ( s ) => s.quarter === quarter && s.year === year );
	if ( activeIndex === -1 ) {
		return null;
	}

	const active = submissions[ activeIndex ];
	const previous = submissions[ activeIndex + 1 ];
	const previousQuarter: Quarter | undefined = previous
		? { quarter: previous.quarter as Quarter[ 'quarter' ], year: previous.year }
		: undefined;

	const aggregateRow = aggregates?.find( ( row ) => row.quarter === quarter && row.year === year );
	const summaryForMetric = ( metricKey: AggregateMetricKey ): MetricSummary | undefined =>
		isFiltered ? metricSummaries?.[ metricKey ] : aggregateRow?.metrics[ metricKey ];
	const sampleSize = isFiltered ? sampleSizeOverride : aggregateRow?.sample_size;

	const configs = getStatCardConfigs();

	return (
		<div className="benchmarks-stats-grid">
			{ configs.map( ( config ) => {
				const currentValue = config.getSubmissionValue( active );
				if ( currentValue === undefined ) {
					return null;
				}
				const previousValue = previous ? config.getSubmissionValue( previous ) : undefined;
				const metricSummary = summaryForMetric( config.metricKey );
				const trendPoints = buildTrendPoints( submissions, activeIndex, config.getSubmissionValue );

				return (
					<StatCard
						key={ config.metricKey }
						config={ config }
						currentValue={ currentValue }
						previousValue={ previousValue }
						previousQuarter={ previousQuarter }
						metricSummary={ metricSummary }
						sampleSize={ sampleSize }
						trendPoints={ trendPoints }
					/>
				);
			} ) }
		</div>
	);
}
