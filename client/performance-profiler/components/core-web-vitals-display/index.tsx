import { useTranslate } from 'i18n-calypso';
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

export const CoreWebVitalsDisplay = ( props: PerformanceMetrics ) => {
	const translate = useTranslate();
	const [ activeTab, setActiveTab ] = useState< string >( 'lcp' );

	const { name: metricName, displayName } = metricsNames[ activeTab as keyof typeof metricsNames ];
	const value = props[ activeTab as keyof PerformanceMetrics ];
	const valuation = mapThresholdsToStatus( activeTab as keyof typeof metricsTresholds, value );

	const displayValuation = ( valuation: string ) => {
		switch ( valuation ) {
			case 'good':
				return 'good';
			case 'needsImprovement':
				return 'needs improvement';
			case 'bad':
				return 'bad';
			default:
				return 'unknown';
		}
	};

	const { good, needsImprovement } = metricsTresholds[ activeTab as keyof typeof metricsTresholds ];
	const formatUnit = ( value: number ) => {
		if ( [ 'lcp', 'fcp', 'ttfb' ].includes( activeTab ) ) {
			return +( value / 1000 ).toFixed( 2 );
		}

		return value;
	};

	const displayUnit = () => {
		if ( [ 'lcp', 'fcp', 'ttfb' ].includes( activeTab ) ) {
			return 'seconds';
		}

		if ( [ 'inp' ].includes( activeTab ) ) {
			return 'milliseconds';
		}

		return '';
	};

	return (
		<div className="core-web-vitals-display">
			<MetricTabBar activeTab={ activeTab } setActiveTab={ setActiveTab } { ...props } />
			<div className="core-web-vitals-display__details">
				<div className="core-web-vitals-display__description">
					<span className="core-web-vitals-display__description-subheading">
						{ translate( "Your site's %(displayName)s is %(valuation)s", {
							args: { displayName, valuation: displayValuation( valuation ) },
						} ) }
					</span>
					<MetricScale metricName={ activeTab } value={ value } valuation={ valuation } />
					<div className="core-web-vitals-display__ranges">
						<div className="range">
							<StatusIndicator speed="good" />
							<div className="range-description">
								<div className="range-heading">{ translate( 'Fast ' ) }</div>
								<div className="range-subheading">
									{ translate( '0-%(to)s %(unit)s', {
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
									{ translate( '%(from)s-%(to)s %(unit)s', {
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
						{ translate( 'What is %(displayName)s? (aka %(metricName)s)', {
							args: { displayName, metricName },
						} ) }
					</span>
					<p>
						Loading speed reflects the time it takes to display the first text or image to visitors.
						The best sites load in under 1.8 seconds. Learn more ↗
					</p>
				</div>
				<div className="core-web-vitals-display__history-graph">
					<span className="core-web-vitals-display__description-subheading">
						Loading speed has increased over the past eight weeks
					</span>
				</div>
			</div>
		</div>
	);
};
