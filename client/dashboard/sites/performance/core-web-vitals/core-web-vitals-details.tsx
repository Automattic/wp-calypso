import { localizeUrl } from '@automattic/i18n-utils';
import { Card, CardBody } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __, sprintf } from '@wordpress/i18n';
import {
	getMetricsNames,
	filterRecommendations,
	mapThresholdsToStatus,
	metricsThresholds,
	displayValue,
	getMetricValuations,
} from '../utils';
import HistoryChart from './charts/history-chart';
import PerformanceScore from './performance-score';
import { StatusIndicator } from './status-indicator';
import { StatusSection } from './status-section';
import { Metrics, PerformanceMetricsHistory, PerformanceMetricsItemQueryResponse } from './index';

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
	const statusClass = status === 'needsImprovement' ? 'needs-improvement' : status;
	const isPerformanceScoreSelected = activeTab === 'overall';

	return (
		<Card>
			<CardBody>
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
											<PerformanceScore score={ value } size={ 72 } />
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
						{ getMetricValuations()[ activeTab ].explanation }
						&nbsp;
						<a
							href={ localizeUrl( getMetricValuations()[ activeTab ].docsUrl ) }
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
							</div>
						</div>
						<div className="range">
							<StatusIndicator speed="needsImprovement" />

							<div className="range-heading">{ __( 'Needs Improvement' ) }</div>
							<div className="range-subheading">
								{ isPerformanceScoreSelected
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
							</div>
						</div>
						<div className="range">
							<StatusIndicator speed="bad" />

							<div className="range-heading">{ __( 'Poor' ) }</div>
							<div className="range-subheading">
								{ isPerformanceScoreSelected
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
							</div>
						</div>
					</div>
				</div>
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
			</CardBody>
		</Card>
	);
};
