import { MetricTabBar } from './metric-tab-bar';

const CoreWebVitalsDisplay = () => {
	return (
		<div>
			<p>CoreWebVitalsDisplay</p>
			<MetricTabBar lcp={ 1966 } cls={ 0.01 } fcp={ 1794 } ttfb={ 916 } inp={ 391 } />
			<div style={ { height: '500px' } }>Description</div>
		</div>
	);
};

export { CoreWebVitalsDisplay };
