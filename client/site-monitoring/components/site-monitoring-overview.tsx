import { FC } from 'react';
import { MetricsTab } from 'calypso/my-sites/site-monitoring/metrics-tab';

const SiteMonitoringOverview: FC = () => {
	return (
		<div className="site-monitoring-overview">
			<MetricsTab />
		</div>
	);
};

export default SiteMonitoringOverview;
