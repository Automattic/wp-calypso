import { localizeUrl } from '@automattic/i18n-utils';
import {
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Card,
	CardBody,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { Metrics } from './core-metrics';
import CoreMetricsChart from './core-metrics-chart';
import { OverallScore, MetricScore } from './core-metrics-score';
import { RecommendationsLink } from './core-web-vitals/recommendations-link';
import { StatusBadge } from './core-web-vitals/status-section';
import {
	getMetricsNames,
	filterRecommendations,
	mapThresholdsToStatus,
	metricsThresholds,
	getMetricValuations,
} from './utils';
import type { PerformanceReport } from '@automattic/api-core';

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
			value: item,
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
				<VStack spacing={ 4 }>
					<HStack spacing={ 2 } justify="space-between" alignment="flex-start">
						<VStack spacing={ 4 } alignment="flex-start">
							<HStack spacing={ 2 } alignment="left">
								<Text size="title" weight={ 500 }>
									{ displayName }
								</Text>
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
							<div style={ { maxWidth: '500px' } }>
								<Text variant="muted">{ getMetricValuations()[ activeTab ].explanation }</Text>
								<a
									href={ localizeUrl( getMetricValuations()[ activeTab ].docsUrl ) }
									target="_blank"
									rel="noreferrer"
								>
									{ __( 'Learn more ↗' ) }
								</a>
							</div>
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
					{ true ? (
						<CoreMetricsChart
							data={ historicalData }
							activeTab={ activeTab }
							metricsThresholds={ metricsThresholds }
						/>
					) : (
						<Text>{ __( 'No history available' ) }</Text>
					) }
				</VStack>
			</CardBody>
		</Card>
	);
}
