import { useTranslate, translate } from 'i18n-calypso';
import { useState } from 'react';
import { PerformanceMetrics } from 'calypso/performance-profiler/types/performance-metrics';
import {
	metricsNames,
	metricsTresholds,
	mapThresholdsToStatus,
} from 'calypso/performance-profiler/utils/metrics';
import { MetricScale } from '../metric-scale';
import { MetricTabBar } from '../metric-tab-bar';
import './style.scss';
import { StatusIndicator } from '../status-indicator';

const metricValuations = {
	fcp: {
		good: translate( "Your site's loading speed is good" ),
		needsImprovement: translate( "Your site's loading speed is moderate" ),
		bad: translate( "Your site's loading speed needs improvement" ),
		heading: translate( 'What is loading speed?' ),
		aka: translate( '(aka First Contentful Paint)' ),
		explanation: translate(
			'Loading speed reflects the time it takes to display the first text or image to visitors. The best sites load in under 1.8 seconds.'
		),
	},
	lcp: {
		good: translate( "Your site's largest content load is good" ),
		needsImprovement: translate( "Your site's largest content load is moderate" ),
		bad: translate( "Your site's largest content load needs improvement" ),
		heading: translate( 'What is largest content load?' ),
		aka: translate( '(aka Largest Contentful Paint)' ),
		explanation: translate(
			'Largest content load measures the time it takes for the largest visible element (like an image or text block) on a page to load. The best sites load in under 2.5 seconds.'
		),
	},
	cls: {
		good: translate( "Your site's visual stability is good" ),
		needsImprovement: translate( "Your site's visual stability is moderate" ),
		bad: translate( "Your site's visual stability needs improvement" ),
		heading: translate( 'What is visual stability needs?' ),
		aka: translate( '(aka Content Layout Shift)' ),
		explanation: translate(
			'Visual stability is assessed by measuring how often content moves unexpectedly during loading. The best sites have a score of 0.1 or lower.'
		),
	},
	inp: {
		good: translate( "Your site's interactivity is good" ),
		needsImprovement: translate( "Your site's interactivity is moderate" ),
		bad: translate( "Your site's interactivity needs improvement" ),
		heading: translate( 'What is interactivity?' ),
		aka: translate( '(aka Interaction to Next Paint)' ),
		explanation: translate(
			'Interactivity measures the overall responsiveness of a webpage by evaluating how quickly it reacts to user interactions. A good score is 200 milliseconds or less, indicating that the page responds swiftly to user inputs.'
		),
	},
	ttfb: {
		good: translate( "Your site's server responsiveness is good" ),
		needsImprovement: translate( "Your site's server responsiveness is moderate" ),
		bad: translate( "Your site's server responsiveness needs improvement" ),
		heading: translate( 'What is server responsiveness?' ),
		aka: translate( '(aka Time To First Byte)' ),
		explanation: translate(
			'Server responsiveness reflects the time taken for a user’s browser to receive the first byte of data from the server after making a request. The best sites load around 800 milliseconds or less.'
		),
	},
};

export const CoreWebVitalsDisplay = ( props: PerformanceMetrics ) => {
	const translate = useTranslate();
	const [ activeTab, setActiveTab ] = useState< string >( 'lcp' );

	const { displayName } = metricsNames[ activeTab as keyof typeof metricsNames ];
	const value = props[ activeTab as keyof PerformanceMetrics ];
	const valuation = mapThresholdsToStatus( activeTab as keyof typeof metricsTresholds, value );

	const { good, needsImprovement } = metricsTresholds[ activeTab as keyof typeof metricsTresholds ];
	const formatUnit = ( value: number ) => {
		if ( [ 'lcp', 'fcp', 'ttfb' ].includes( activeTab ) ) {
			return +( value / 1000 ).toFixed( 2 );
		}

		return value;
	};

	const displayUnit = () => {
		if ( [ 'lcp', 'fcp', 'ttfb' ].includes( activeTab ) ) {
			return translate( 'seconds', { comment: 'Used for displaying a range, eg. 1-2 seconds' } );
		}

		if ( [ 'inp' ].includes( activeTab ) ) {
			return translate( 'milliseconds', {
				comment: 'Used for displaying a range, eg. 100-200 millisenconds',
			} );
		}

		return '';
	};

	return (
		<div className="core-web-vitals-display">
			<MetricTabBar activeTab={ activeTab } setActiveTab={ setActiveTab } { ...props } />
			<div className="core-web-vitals-display__details">
				<div className="core-web-vitals-display__description">
					<span className="core-web-vitals-display__description-subheading">
						{ metricValuations[ activeTab ][ valuation ] }
					</span>
					<MetricScale metricName={ activeTab } value={ value } valuation={ valuation } />
					<div className="core-web-vitals-display__ranges">
						<div className="range">
							<StatusIndicator speed="good" />
							<div className="range-description">
								<div className="range-heading">{ translate( 'Fast' ) }</div>
								<div className="range-subheading">
									{ translate( '0–%(to)s %(unit)s', {
										args: { to: formatUnit( good ), unit: displayUnit() },
									} ) }
								</div>
							</div>
						</div>
						<div className="range">
							<StatusIndicator speed="needsImprovement" />
							<div className="range-description">
								<div className="range-heading">{ translate( 'Moderate' ) }</div>
								<div className="range-subheading">
									{ translate( '%(from)s–%(to)s %(unit)s', {
										args: {
											from: formatUnit( good ),
											to: formatUnit( needsImprovement ),
											unit: displayUnit(),
										},
									} ) }
								</div>
							</div>
						</div>
						<div className="range">
							<StatusIndicator speed="bad" />
							<div className="range-description">
								<div className="range-heading">{ translate( 'Slow' ) }</div>
								<div className="range-subheading">
									{ translate( '%(from)s+ %(unit)s', {
										args: {
											from: formatUnit( needsImprovement ),
											unit: displayUnit(),
										},
									} ) }
								</div>
							</div>
						</div>
					</div>
					<span className="core-web-vitals-display__description-subheading">
						{ metricValuations[ activeTab ].heading }&nbsp;
					</span>
					<span className="core-web-vitals-display__description-aka">
						{ metricValuations[ activeTab ].aka }
					</span>
					<p>
						{ metricValuations[ activeTab ].explanation }
						&nbsp;
						<a href={ `https://web.dev/articles/${ activeTab }` }>
							{ translate( 'Learn more ↗' ) }
						</a>
					</p>
				</div>
				<div className="core-web-vitals-display__history-graph">
					<span className="core-web-vitals-display__description-subheading">
						{ translate( '%s has increased over the past eight weeks', { args: [ displayName ] } ) }
					</span>
				</div>
			</div>
		</div>
	);
};
