import { MetricTabBar } from '../metric-tab-bar';
import './style.scss';

const CoreWebVitalsDisplay = () => {
	return (
		<div className="core-web-vitals-display">
			<MetricTabBar lcp={ 1966 } cls={ 0.01 } fcp={ 1794 } ttfb={ 916 } inp={ 391 } />
			<div className="core-web-vitals-display__description">
				<p>Your site’s loading speed is moderate</p>
				<p>What is loading speed? (aka First Contentful Paint)</p>
				<p>
					Loading speed reflects the time it takes to display the first text or image to visitors.
					The best sites load in under 1.8 seconds. Learn more ↗
				</p>
			</div>
		</div>
	);
};

export { CoreWebVitalsDisplay };
