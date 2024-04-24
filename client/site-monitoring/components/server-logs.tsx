import { FC } from 'react';
import { LogsTab } from 'calypso/my-sites/site-monitoring/logs-tab';

const SiteMonitoringServerLogs: FC = () => {
	return (
		<div className="site-monitoring-server-logs">
			<LogsTab logType="web" />
		</div>
	);
};

export default SiteMonitoringServerLogs;
