import { useDesktopBreakpoint } from '@automattic/viewport-react';
import { useTranslate } from 'i18n-calypso';
import {
	Metrics,
	PerformanceMetricsHistory,
	PerformanceMetricsItemQueryResponse,
} from 'calypso/data/site-profiler/types';
import { CircularPerformanceScore } from 'calypso/hosting/performance/components/circular-performance-score/circular-performance-score';
import {
	metricsNames,
	metricsThresholds,
	mapThresholdsToStatus,
	metricValuations,
	displayValue,
	filterRecommendations,
} from 'calypso/performance-profiler/utils/metrics';
import HistoryChart from '../charts/history-chart';
import { StatusIndicator } from '../status-indicator';
import { StatusSection } from '../status-section';

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
	const translate = useTranslate();
	const isMobile = ! useDesktopBreakpoint();

	if ( ! activeTab ) {
		return null;
	}

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
			return translate( 's', { comment: 'Used for displaying a time range in seconds, eg. 1-2s' } );
		}
		if ( [ 'inp', 'tbt' ].includes( activeTab ) ) {
			return translate( 'ms', {
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
					{ metricValuations[ activeTab ].explanation }
					&nbsp;
					{ isPerformanceScoreSelected ? (
						<a
							href="https://developer.chrome.com/docs/lighthouse/performance/performance-scoring"
							target="_blank"
							rel="noreferrer"
						>
							{ translate( 'See calculator ↗' ) }
						</a>
					) : (
						<a
							href={ `https://web.dev/articles/${ encodeURIComponent( activeTab ) }` }
							target="_blank"
							rel="noreferrer"
						>
							{ translate( 'Learn more ↗' ) }
						</a>
					) }
				</p>
				<div className="core-web-vitals-display__ranges">
					<div className="range">
						<StatusIndicator speed="good" />
						<div className="range-heading">{ translate( 'Excellent' ) }</div>
						<div className="range-subheading">
							{ isPerformanceScoreSelected
								? translate( '(90–%(to)s)', {
										args: { to: formatUnit( good ) },
										comment: 'Displaying a percentage range, eg. 90-100',
								  } )
								: translate( '(0–%(to)s%(unit)s)', {
										args: { to: formatUnit( good ), unit: displayUnit() },
										comment: 'Displaying a time range, eg. 0-1s',
								  } ) }
						</div>
					</div>
					<div className="range">
						<StatusIndicator speed="needsImprovement" />

						<div className="range-heading">{ translate( 'Needs Improvement' ) }</div>
						<div className="range-subheading">
							{ isPerformanceScoreSelected
								? translate( '(%(from)s–%(to)s)', {
										args: {
											from: 50,
											to: formatUnit( needsImprovement ),
										},
										comment: 'Displaying a percentage range, eg. 50-89',
								  } )
								: translate( '(%(from)s–%(to)s%(unit)s)', {
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

						<div className="range-heading">{ translate( 'Poor' ) }</div>
						<div className="range-subheading">
							{ isPerformanceScoreSelected
								? translate( '(%(from)s-%(to)s) ', {
										args: {
											from: 0,
											to: formatUnit( bad ),
										},
										comment: 'Displaying a percentage range, eg. 0-49',
								  } )
								: translate( '(Over %(from)s%(unit)s) ', {
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
