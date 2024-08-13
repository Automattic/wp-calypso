import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import {
	metricsNames,
	metricsTresholds,
	mapThresholdsToStatus,
} from 'calypso/performance-profiler/utils/metrics';
import { MetricScale } from '../metric-scale';
import { MetricTabBar } from '../metric-tab-bar';
import './style.scss';

const CoreWebVitalsDisplay = () => {
	const translate = useTranslate();
	const [ activeTab, setActiveTab ] = useState< string >( 'lcp' );

	const metricName = metricsNames[ activeTab as keyof typeof metricsNames ];
	const valuation = mapThresholdsToStatus( activeTab as keyof typeof metricsTresholds, 1966 );

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

	return (
		<div className="core-web-vitals-display">
			<MetricTabBar
				lcp={ 1966 }
				cls={ 0.01 }
				fcp={ 1794 }
				ttfb={ 916 }
				inp={ 391 }
				activeTab={ activeTab }
				setActiveTab={ setActiveTab }
			/>
			<div className="core-web-vitals-display__details">
				<div className="core-web-vitals-display__description">
					<span className="core-web-vitals-display__description-subheading">
						{ translate( "Your site's %(metricName)s is %(valuation)s", {
							args: { metricName, valuation: displayValuation( valuation ) },
						} ) }
					</span>
					<MetricScale metricName={ activeTab } value={ 1970 } />
					<span className="core-web-vitals-display__description-subheading">
						{ translate( 'What is %(metricName)s?', {
							args: { metricName },
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

export { CoreWebVitalsDisplay };
