import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { PerformanceMetrics } from 'calypso/performance-profiler/types/performance-metrics';
import {
	metricsNames,
	metricsTresholds,
	mapThresholdsToStatus,
	metricValuations,
} from 'calypso/performance-profiler/utils/metrics';
import { MetricScale } from '../metric-scale';
import { MetricTabBar } from '../metric-tab-bar';
import { StatusIndicator } from '../status-indicator';
import './style.scss';

export const CoreWebVitalsDisplay = ( props: PerformanceMetrics ) => {
	const translate = useTranslate();
	const [ activeTab, setActiveTab ] = useState< keyof PerformanceMetrics >( 'lcp' );

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
