import { Button } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { info } from '@wordpress/icons';
import RangePlot from '../range-plot';
import StatDeltaPill from './stat-delta-pill';
import StatStatusBadge from './stat-status-badge';
import StatTrendChart from './stat-trend-chart';
import type { StatCardConfig } from './stat-card-config';
import type { BadgeKind } from './stat-status-badge';
import type { TrendPoint } from './stat-trend-chart';
import type { MetricSummary, Quarter } from '../../../../constants';

const COLOR_BAND = 'var(--color-primary-0)';
const COLOR_AGENCY = 'var(--color-primary-50)';
const COLOR_MEDIAN = 'var(--color-success-40)';

type Props = {
	config: StatCardConfig;
	currentValue: number;
	previousValue: number | undefined;
	previousQuarter: Quarter | undefined;
	metricSummary: MetricSummary | undefined;
	sampleSize: number | undefined;
	trendPoints: TrendPoint[];
};

function getBadgeKind( agencyValue: number, median: number, higherIsBetter: boolean ): BadgeKind {
	if ( agencyValue === median ) {
		return 'at';
	}
	const isAbove = agencyValue > median;
	return ( isAbove && higherIsBetter ) || ( ! isAbove && ! higherIsBetter ) ? 'better' : 'below';
}

export default function StatCard( {
	config,
	currentValue,
	previousValue,
	previousQuarter,
	metricSummary,
	sampleSize,
	trendPoints,
}: Props ) {
	const delta = previousValue !== undefined ? currentValue - previousValue : undefined;
	// A real peer distribution requires more than one distinct value across the sample. With n=1
	// (only the agency submitted), all five summary stats collapse to the same number and the
	// range plot has no width — show a substitute message instead.
	const hasPeerDistribution =
		metricSummary !== undefined && metricSummary.min !== metricSummary.max;
	const badge = hasPeerDistribution
		? getBadgeKind( currentValue, metricSummary.median, config.higherIsBetter )
		: undefined;

	return (
		<article className="benchmarks-stat-card">
			<header className="benchmarks-stat-card-header">
				<div className="benchmarks-stat-card-label">
					<span>{ config.label }</span>
					<Button
						className="benchmarks-stat-card-info"
						icon={ info }
						iconSize={ 16 }
						size="small"
						label={ config.infoText }
					/>
				</div>
				{ badge && <StatStatusBadge kind={ badge } /> }
			</header>
			<div className="benchmarks-stat-card-value">{ config.formatter( currentValue ) }</div>
			{ delta !== undefined && previousQuarter && (
				<StatDeltaPill
					delta={ delta }
					formatDelta={ config.formatDelta }
					previousQuarter={ previousQuarter }
					higherIsBetter={ config.higherIsBetter }
				/>
			) }
			{ hasPeerDistribution ? (
				<>
					<RangePlot
						min={ metricSummary.min }
						max={ metricSummary.max }
						ranges={ [ { from: metricSummary.p25, to: metricSummary.p75, color: COLOR_BAND } ] }
						markers={ [
							{
								value: metricSummary.median,
								color: COLOR_MEDIAN,
								ariaLabel: __( 'Peer median' ),
							},
							{
								value: currentValue,
								color: COLOR_AGENCY,
								ariaLabel: __( 'Your value' ),
							},
						] }
						axisLabels={ [
							{
								value: metricSummary.min,
								label: config.formatter( metricSummary.min ),
							},
							{
								value: metricSummary.p25,
								label: sprintf(
									/* translators: %s: formatted p25 value, e.g. 38.7%. */
									__( 'p25 %s' ),
									config.formatter( metricSummary.p25 )
								),
							},
							{
								value: metricSummary.p75,
								label: sprintf(
									/* translators: %s: formatted p75 value. */
									__( 'p75 %s' ),
									config.formatter( metricSummary.p75 )
								),
							},
							{
								value: metricSummary.max,
								label: config.formatter( metricSummary.max ),
							},
						] }
						ariaLabel={ sprintf(
							/* translators: %s: metric label, e.g. "Gross margin". */
							__( '%s peer distribution' ),
							config.label
						) }
					/>
					<div className="benchmarks-stat-card-legend">
						<div className="benchmarks-stat-card-legend-items">
							<span className="benchmarks-stat-card-legend-item">
								<span
									className="benchmarks-stat-card-legend-dot"
									style={ { background: COLOR_AGENCY } }
								/>
								{ __( 'Your agency' ) }
							</span>
							<span className="benchmarks-stat-card-legend-item">
								<span
									className="benchmarks-stat-card-legend-dot"
									style={ { background: COLOR_MEDIAN } }
								/>
								{ __( 'Peers in A4A' ) }
							</span>
						</div>
						<strong>
							{ sprintf(
								/* translators: %1$s: median value, %2$d: peer sample size. */
								__( '%1$s (n=%2$d)' ),
								config.formatter( metricSummary.median ),
								sampleSize ?? 0
							) }
						</strong>
					</div>
					<p className="benchmarks-stat-card-helper">{ __( 'Showing only peers in A4A.' ) }</p>
				</>
			) : (
				<p className="benchmarks-stat-card-helper">
					{ __( 'Not enough peer data to compare yet.' ) }
				</p>
			) }
			{ trendPoints.length >= 2 ? (
				<>
					<StatTrendChart points={ trendPoints } formatter={ config.formatter } />
					<p className="benchmarks-stat-card-caption">
						{ sprintf(
							/* translators: %1$d: count of quarters in trend, %2$d: peer sample size. */
							__( 'Your trend · %1$d quarters · peer sample %2$d' ),
							trendPoints.length,
							sampleSize ?? 0
						) }
					</p>
				</>
			) : (
				<p className="benchmarks-stat-card-caption is-muted">
					{ __( 'Submit more quarters to see a trend.' ) }
				</p>
			) }
		</article>
	);
}
