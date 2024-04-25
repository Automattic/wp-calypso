import { FC } from 'react';
import { LogsTab } from 'calypso/my-sites/site-monitoring/logs-tab';

const SiteMonitoringPhpLogs: FC = () => {
	return (
		<div className="site-monitoring-php-logs">
			<LogsTab logType="php" />
		</div>
	);
};

export default SiteMonitoringPhpLogs;
