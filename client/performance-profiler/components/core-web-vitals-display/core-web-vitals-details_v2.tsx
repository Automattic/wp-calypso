import { useTranslate } from 'i18n-calypso';
import { Metrics, PerformanceMetricsHistory } from 'calypso/data/site-profiler/types';
import {
	metricsNames,
	metricsTresholds,
	mapThresholdsToStatus,
	metricValuations,
	displayValue,
} from 'calypso/performance-profiler/utils/metrics';
import HistoryChart from '../charts/history-chart';
import { StatusIndicator } from '../status-indicator';
import { StatusSection } from '../status-section';

type CoreWebVitalsDetailsProps = Record< Metrics, number > & {
	history: PerformanceMetricsHistory;
	activeTab: Metrics | null;
};

export const CoreWebVitalsDetailsV2: React.FC< CoreWebVitalsDetailsProps > = ( {
	activeTab,
	history,
	...metrics
} ) => {
	const translate = useTranslate();

	if ( ! activeTab ) {
		return null;
	}

	const { name: displayName } = metricsNames[ activeTab ];
	const value = metrics[ activeTab ];

	const { good, needsImprovement } = metricsTresholds[ activeTab ];

	const formatUnit = ( value: number ) => {
		if ( [ 'lcp', 'fcp', 'ttfb' ].includes( activeTab ) ) {
			return +( value / 1000 ).toFixed( 2 );
		}
		return value;
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

	// last 8 weeks only
	metricsData = metricsData.slice( -8 );
	dates = dates.slice( -8 );

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

	const status = mapThresholdsToStatus( activeTab as Metrics, value );
	const statusClass = status === 'needsImprovement' ? 'needs-improvement' : status;

	return (
		<div
			className="core-web-vitals-display__details"
			style={ {
				flexDirection: 'column',
			} }
		>
			<div className="core-web-vitals-display__description">
				<div
					css={ {
						display: 'flex',
						gap: '24px',
					} }
				>
					<div
						css={ {
							flex: 1,
						} }
					>
						<span className="core-web-vitals-display__description-subheading">{ displayName }</span>
						<div className={ `core-web-vitals-display__metric ${ statusClass }` }>
							{ displayValue( activeTab as Metrics, value ) }
						</div>
						<p>
							{ metricValuations[ activeTab ].explanation }
							&nbsp;
							<a href={ `https://web.dev/articles/${ activeTab }` }>
								{ translate( 'Learn more ↗' ) }
							</a>
						</p>
					</div>
					<StatusSection value={ status } recommendationsQuantity={ 3 } />
				</div>
				<div className="core-web-vitals-display__ranges">
					<div className="range">
						<StatusIndicator speed="good" />
						<div className="range-heading">{ translate( 'Excellent' ) }</div>
						<div className="range-subheading">
							{ translate( '(0–%(to)s%(unit)s)', {
								args: { to: formatUnit( good ), unit: displayUnit() },
								comment: 'Displaying a time range, eg. 0-1s',
							} ) }
						</div>
					</div>
					<div className="range">
						<StatusIndicator speed="needsImprovement" />

						<div className="range-heading">{ translate( 'Needs Improvement' ) }</div>
						<div className="range-subheading">
							{ translate( '(%(from)s–%(to)s%(unit)s)', {
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
							{ translate( '(Over %(from)s%(unit)s) ', {
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
						formatUnit( metricsTresholds[ activeTab ].good ),
						formatUnit( metricsTresholds[ activeTab ].needsImprovement ),
					] }
					height={ 300 }
					d3Format="%b %d"
					isMobile={ false }
				/>
			</div>
		</div>
	);
};
