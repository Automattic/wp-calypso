import { MetricTabBar } from './metric-tab-bar';

const CoreWebVitalsDisplay = () => {
	return (
		<div>
			<p>CoreWebVitalsDisplay</p>
			<MetricTabBar
				activeTab="server-responsiveness"
				setActiveTab={ () => {} }
				lcp={ 1966 }
				cls={ 0.01 }
				fcp={ 1794 }
				ttfb={ 916 }
				inp={ 391 }
			/>
		</div>
	);
};

export { CoreWebVitalsDisplay };
