import { LogType, SiteLogs } from './components/site-logs';
import { SiteLogsHeader } from './components/site-logs-header';

export default function Logs( { logType }: { logType: LogType } ) {
	return (
		<div className="tools-logs">
			<SiteLogsHeader logType={ logType } />
			<SiteLogs logType={ logType } />
		</div>
	);
}
