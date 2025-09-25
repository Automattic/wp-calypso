import { localizeUrl } from '@automattic/i18n-utils';
import { useViewportMatch } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import {
	Metrics,
	PerformanceMetricsHistory,
	PerformanceMetricsItemQueryResponse,
} from './index';
import { CircularPerformanceScore } from 'calypso/hosting/performance/components/circular-performance-score/circular-performance-score';
import {
	getMetricsNames,
	metricsThresholds,
	mapThresholdsToStatus,
	getMetricValuations,
	displayValue,
	filterRecommendations,
} from 'calypso/performance-profiler/utils/metrics';
import HistoryChart from './charts/history-chart';
import { StatusIndicator } from './status-indicator';
import { StatusSection } from './status-section';

type CoreWebVitalsDetailsProps = Record< Metrics, number > & {
	history: PerformanceMetricsHistory;
	activeTab: Metrics | null;
	audits: Record< string, PerformanceMetricsItemQueryResponse >;
	recommendationsRef: React.RefObject< HTMLDivElement > | null;
	onRecommendationsFilterChange?: ( filter: string ) => void;
};

export const CoreWebVitalsDetails: React.FC< CoreWebVitalsDetailsProps > = ( {
	activeTab,
	history,
	audits,
	recommendationsRef,
	onRecommendationsFilterChange,
	...metrics
} ) => {
	const isMobile = ! useViewportMatch( 'medium' );

	if ( ! activeTab ) {
		return null;
	}

	const metricsNames = getMetricsNames( __ );
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
			return __( 's', { comment: 'Used for displaying a time range in seconds, eg. 1-2s' } );
		}
		if ( [ 'inp', 'tbt' ].includes( activeTab ) ) {
			return __( 'ms', {
				comment: 'Used for displaying a range in milliseconds, eg. 100-200ms',
			} );
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
	const statusClass = status === 'needsImprovement' ? 'needs-improvement' : status;
	const isPerformanceScoreSelected = activeTab === 'overall';

	return (
		<div className="core-web-vitals-display__details">
			<div className="core-web-vitals-display__description">
				<div className="core-web-vitals-display__description-container">
					<div className="header">
						{ ! isMobile && (
							<span className="core-web-vitals-display__description-subheading">
								{ displayName }
							</span>
						) }

						{ ! isMobile && (
							<div className={ `core-web-vitals-display__metric ${ statusClass }` }>
								{ isPerformanceScoreSelected ? (
									<div className="metric-tab-bar__tab-metric performance-score tab">
										<CircularPerformanceScore score={ value } size={ 72 } />
									</div>
								) : (
									displayValue( activeTab as Metrics, value )
								) }
							</div>
						) }
					</div>
					<StatusSection
						activeTab={ activeTab }
						recommendationsRef={ recommendationsRef }
						value={ status }
						onRecommendationsFilterChange={ onRecommendationsFilterChange }
						recommendationsQuantity={ numberOfAuditsForMetric }
					/>
				</div>
				<p>
					{ getMetricValuations( __ )[ activeTab ].explanation }
					&nbsp;
					<a
						href={ localizeUrl( getMetricValuations( __ )[ activeTab ].docsUrl ) }
						target="_blank"
						rel="noreferrer"
					>
						{ __( 'Learn more ↗' ) }
					</a>
				</p>
				<div className="core-web-vitals-display__ranges">
					<div className="range">
						<StatusIndicator speed="good" />
						<div className="range-heading">{ __( 'Excellent' ) }</div>
						<div className="range-subheading">
							{ isPerformanceScoreSelected
								? __( '(90–%(to)s)', {
										args: { to: formatUnit( good ) },
										comment: 'Displaying a percentage range, eg. 90-100',
								  } )
								: __( '(0–%(to)s%(unit)s)', {
										args: { to: formatUnit( good ), unit: displayUnit() },
										comment: 'Displaying a time range, eg. 0-1s',
								  } ) }
						</div>
					</div>
					<div className="range">
						<StatusIndicator speed="needsImprovement" />

						<div className="range-heading">{ __( 'Needs Improvement' ) }</div>
						<div className="range-subheading">
							{ isPerformanceScoreSelected
								? __( '(%(from)s–%(to)s)', {
										args: {
											from: 50,
											to: formatUnit( needsImprovement ),
										},
										comment: 'Displaying a percentage range, eg. 50-89',
								  } )
								: __( '(%(from)s–%(to)s%(unit)s)', {
										args: {
											from: formatUnit( good ),
											to: formatUnit( needsImprovement ),
											unit: displayUnit(),
										},
										comment: 'Displaying a time range, eg. 2-3s',
								  } ) }
						</div>
					</div>
					<div className="range">
						<StatusIndicator speed="bad" />

						<div className="range-heading">{ __( 'Poor' ) }</div>
						<div className="range-subheading">
							{ isPerformanceScoreSelected
								? __( '(%(from)s-%(to)s) ', {
										args: {
											from: 0,
											to: formatUnit( bad ),
										},
										comment: 'Displaying a percentage range, eg. 0-49',
								  } )
								: __( '(Over %(from)s%(unit)s) ', {
										args: {
											from: formatUnit( needsImprovement ),
											unit: displayUnit(),
										},
										comment: 'Displaying a time range, eg. >2s',
								  } ) }
						</div>
					</div>
				</div>
			</div>
			<div className="core-web-vitals-display__history-graph-container">
				<HistoryChart
					data={ dataAvailable && historicalData }
					range={ [
						formatUnit( metricsThresholds[ activeTab ].good ),
						formatUnit( metricsThresholds[ activeTab ].needsImprovement ),
					] }
					height={ 300 }
					d3Format="%b %d"
					isMobile={ isMobile }
				/>
			</div>
		</div>
	);
};
