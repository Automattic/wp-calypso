import { __, sprintf } from '@wordpress/i18n';
import type { AgencyBenchmark, AggregateMetricKey } from '../../../../constants';

const fmtPercent = ( v: number ) => `${ v.toFixed( 1 ) }%`;
const fmtPercentDelta = ( d: number ) => `${ d >= 0 ? '+' : '' }${ d.toFixed( 1 ) }%`;

const fmtCurrency = ( v: number ) => `$${ Math.round( v ).toLocaleString( 'en-US' ) }`;
const fmtCurrencyDelta = ( d: number ) =>
	`${ d >= 0 ? '+' : '-' }$${ Math.abs( Math.round( d ) ).toLocaleString( 'en-US' ) }`;

const fmtDays = ( v: number ) =>
	sprintf(
		/* translators: %d: number of days. */
		__( '%d days' ),
		Math.round( v )
	);
const fmtDaysDelta = ( d: number ) =>
	sprintf(
		/* translators: %s: signed number of days, e.g. "+5" or "-3". */
		__( '%s days' ),
		`${ d >= 0 ? '+' : '' }${ Math.round( d ) }`
	);

const fmtScore = ( v: number ) => `${ Math.round( v ) }`;
const fmtScoreDelta = ( d: number ) => `${ d >= 0 ? '+' : '' }${ Math.round( d ) }`;

export type StatCardConfig = {
	metricKey: AggregateMetricKey;
	label: string;
	infoText: string;
	formatter: ( value: number ) => string;
	formatDelta: ( delta: number ) => string;
	higherIsBetter: boolean;
	getSubmissionValue: ( submission: AgencyBenchmark ) => number | undefined;
};

export function getStatCardConfigs(): StatCardConfig[] {
	return [
		{
			metricKey: 'ai_maturity_score',
			label: __( 'AI maturity' ),
			infoText: __(
				'Composite 0 to 100 score from adoption, revenue, training, governance, productivity, services, and client demand.'
			),
			formatter: fmtScore,
			formatDelta: fmtScoreDelta,
			higherIsBetter: true,
			getSubmissionValue: ( s ) => s.computed?.ai_maturity_score,
		},
		{
			metricKey: 'gross_margin',
			label: __( 'Gross margin' ),
			infoText: __( 'Revenue minus direct cost of delivery, as a percentage of revenue.' ),
			formatter: fmtPercent,
			formatDelta: fmtPercentDelta,
			higherIsBetter: true,
			getSubmissionValue: ( s ) => s.gross_margin,
		},
		{
			metricKey: 'billable_utilization',
			label: __( 'Billable utilization' ),
			infoText: __( 'Percentage of total team hours billed to clients.' ),
			formatter: fmtPercent,
			formatDelta: fmtPercentDelta,
			higherIsBetter: true,
			getSubmissionValue: ( s ) => s.billable_utilization,
		},
		{
			metricKey: 'avg_project_size_usd',
			label: __( 'Avg project size' ),
			infoText: __( 'Average revenue per closed project in the quarter.' ),
			formatter: fmtCurrency,
			formatDelta: fmtCurrencyDelta,
			higherIsBetter: true,
			getSubmissionValue: ( s ) => s.avg_project_size_usd,
		},
		{
			metricKey: 'win_rate',
			label: __( 'Win rate' ),
			infoText: __( 'Percentage of qualified proposals that converted to signed work.' ),
			formatter: fmtPercent,
			formatDelta: fmtPercentDelta,
			higherIsBetter: true,
			getSubmissionValue: ( s ) => s.win_rate,
		},
		{
			metricKey: 'retainer_mrr_usd',
			label: __( 'Retainer MRR' ),
			infoText: __( 'Recurring monthly revenue under retainer agreements.' ),
			formatter: fmtCurrency,
			formatDelta: fmtCurrencyDelta,
			higherIsBetter: true,
			getSubmissionValue: ( s ) => s.retainer_mrr_usd,
		},
		{
			metricKey: 'avg_time_to_close_days',
			label: __( 'Avg time to close' ),
			infoText: __( 'Average days between first contact and a signed contract. Lower is better.' ),
			formatter: fmtDays,
			formatDelta: fmtDaysDelta,
			higherIsBetter: false,
			getSubmissionValue: ( s ) => s.avg_time_to_close_days,
		},
		{
			metricKey: 'client_retention',
			label: __( 'Client retention' ),
			infoText: __( 'Percentage of active clients retained quarter over quarter.' ),
			formatter: fmtPercent,
			formatDelta: fmtPercentDelta,
			higherIsBetter: true,
			getSubmissionValue: ( s ) => s.client_retention,
		},
	];
}
