import { localizeUrl } from '@automattic/i18n-utils';
import {
	__experimentalText as Text,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	Card,
	CardBody,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __, sprintf } from '@wordpress/i18n';
import {
	getMetricsNames,
	filterRecommendations,
	mapThresholdsToStatus,
	metricsThresholds,
	displayValue,
	getMetricValuations,
} from './utils';
import Chart from './core-web-vitals/charts/chart';
import { StatusIndicator } from './core-web-vitals/status-indicator';
import { StatusBadge } from './core-web-vitals/status-section';
import { RecommendationsLink } from './core-web-vitals/recommendations-link';
import { Metrics } from './core-metrics';
import type { PerformanceReport } from '@automattic/api-core';
import { OverallScore, MetricScore } from './core-metrics-score';

export default function CoreMetricsContent( {
	report,
	activeTab,
	recommendationsRef,
	onRecommendationsFilterChange,
}: {
	report: PerformanceReport;
	activeTab: Metrics | null;
	recommendationsRef: React.RefObject< HTMLDivElement > | null;
	onRecommendationsFilterChange?: ( filter: string ) => void;
} ) {
	const { overall_score, fcp, lcp, cls, inp, ttfb, tbt, audits, history } = report;

	const metrics = {
		fcp,
		lcp,
		cls,
		inp,
		ttfb,
		tbt,
		overall: overall_score * 100,
	};
	const isMobile = ! useViewportMatch( 'medium' );

	if ( ! activeTab ) {
		return null;
	}

	const metricsNames = getMetricsNames();
	const { name: displayName } = metricsNames[ activeTab ];
	const value = metrics[ activeTab ];

	const { good, needsImprovement, bad } = metricsThresholds[ activeTab ];

	const formatUnit = ( value: number | string ) => {
		const num = parseFloat( value as string );
		if ( [ 'lcp', 'fcp', 'ttfb' ].includes( activeTab ) ) {
			return +( num / 1000 ).toFixed( 2 );
		}
		return num;
	};

	const displayUnit = () => {
		if ( [ 'lcp', 'fcp', 'ttfb' ].includes( activeTab ) ) {
			return __( 's' );
		}
		if ( [ 'inp', 'tbt' ].includes( activeTab ) ) {
			return __( 'ms' );
		}
		return '';
	};

	// Add leading zero to date values. Safari expects the date string to follow the ISO 8601 format (i.e., YYYY-MM-DD)
	const addLeadingZero = ( value: number ) => {
		if ( value < 10 ) {
			return `0${ value }`;
		}
		return value;
	};

	let metricsData: number[] = history?.metrics[ activeTab ] ?? [];
	let dates = history?.collection_period ?? [];

	const weeksToShow = isMobile ? 6 : 8;
	metricsData = metricsData.slice( -weeksToShow );
	dates = dates.slice( -weeksToShow );

	const dataAvailable = metricsData.length > 0 && metricsData.some( ( item ) => item !== null );
	const historicalData = metricsData.map( ( item, index ) => {
		let formattedDate: unknown;
		const date = dates[ index ];
		if ( 'string' === typeof date ) {
			formattedDate = date;
		} else {
			const { year, month, day } = date;
			formattedDate = `${ year }-${ addLeadingZero( month ) }-${ addLeadingZero( day ) }`;
		}

		return {
			date: formattedDate,
			value: formatUnit( item ),
		};
	} );

	const numberOfAuditsForMetric = Object.keys( audits ).filter( ( key ) =>
		filterRecommendations( activeTab === 'overall' ? 'all' : activeTab, audits[ key ] )
	).length;

	const status = mapThresholdsToStatus( activeTab as Metrics, value );
	const isOverall = activeTab === 'overall';

	return (
		<Card>
			<CardBody>
				<HStack spacing={ 2 }>
					<VStack spacing={ 2 }>
						<HStack spacing={ 2 }>
							<Text size="title">{ displayName }</Text>
							<StatusBadge value={ status } />
						</HStack>

						{ isOverall ? (
							<OverallScore
								size={ 32 }
								metric={ activeTab as Metrics }
								status={ status }
								value={ value }
							/>
						) : (
							<MetricScore
								size={ 32 }
								metric={ activeTab as Metrics }
								status={ status }
								value={ value }
							/>
						) }
					</VStack>
					{ numberOfAuditsForMetric > 0 && (
						<RecommendationsLink
							activeTab={ activeTab }
							recommendationsQuantity={ numberOfAuditsForMetric }
							recommendationsRef={ recommendationsRef }
							onRecommendationsFilterChange={ onRecommendationsFilterChange }
						/>
					) }
				</HStack>
				<Text variant="muted">
					{ getMetricValuations()[ activeTab ].explanation }
					<a
						href={ localizeUrl( getMetricValuations()[ activeTab ].docsUrl ) }
						target="_blank"
						rel="noreferrer"
					>
						{ __( 'Learn more ↗' ) }
					</a>
				</Text>
				<HStack spacing={ 2 } justify="flex-start">
					<HStack justify="flex-start">
						<StatusIndicator speed="good" />
						<Text size="small">{ __( 'Excellent' ) }</Text>
						<Text>
							{ isOverall
								? sprintf(
										/* translators: %(to)s is the good threshold */
										__( '(90–%(to)s)' ),
										{
											to: formatUnit( good ),
										}
								  )
								: sprintf(
										/* translators: %(to)s is the good threshold, %(unit)s is the unit */
										__( '(0–%(to)s%(unit)s)' ),
										{
											to: formatUnit( good ),
											unit: displayUnit(),
										}
								  ) }
						</Text>
					</HStack>
					<HStack justify="flex-start">
						<StatusIndicator speed="needsImprovement" />

						<Text size="small">{ __( 'Needs Improvement' ) }</Text>
						<Text>
							{ isOverall
								? sprintf(
										/* translators: %(to)s is the needs improvement threshold */
										__( '(50–%(to)s)' ),
										{
											to: formatUnit( needsImprovement ),
										}
								  )
								: sprintf(
										/* translators: %(from)s is the good threshold, %(to)s is the needs improvement threshold, %(unit)s is the unit */
										__( '(%(from)s–%(to)s%(unit)s)' ),
										{
											from: formatUnit( good ),
											to: formatUnit( needsImprovement ),
											unit: displayUnit(),
										}
								  ) }
						</Text>
					</HStack>
					<HStack justify="flex-start">
						<StatusIndicator speed="bad" />

						<Text size="small">{ __( 'Poor' ) }</Text>
						<Text>
							{ isOverall
								? sprintf(
										/* translators: %(to)s is the bad threshold */
										__( '(0-%(to)s)' ),
										{
											to: formatUnit( bad ),
										}
								  )
								: sprintf(
										/* translators: %(from)s is the needs improvement threshold, %(unit)s is the unit */
										__( '(Over %(from)s%(unit)s)' ),
										{
											from: formatUnit( needsImprovement ),
											unit: displayUnit(),
										}
								  ) }
						</Text>
					</HStack>
				</HStack>
				{ dataAvailable ? (
					<Chart data={ historicalData } />
				) : (
					<Text>{ __( 'No history available' ) }</Text>
				) }
				{ /* <HistoryChart
					data={ dataAvailable && historicalData }
					range={ [
						formatUnit( metricsThresholds[ activeTab ].good ),
						formatUnit( metricsThresholds[ activeTab ].needsImprovement ),
					] }
					height={ 300 }
					d3Format="%b %d"
					isMobile={ isMobile }
				/> */ }
			</CardBody>
		</Card>
	);
}
