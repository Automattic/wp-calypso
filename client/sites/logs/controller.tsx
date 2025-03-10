import { LogType } from 'calypso/data/hosting/use-site-logs-query';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { SiteLogsDataViews } from './components/site-logs';
import type { Context as PageJSContext } from '@automattic/calypso-router';

export function phpErrorLogs( context: PageJSContext, next: () => void ) {
	context.primary = (
		<div className="site-logs">
			<PageViewTracker path="/site-logs/:site/php" title="Sites > Logs > PHP" />
			<SiteLogsDataViews logType={ LogType.PHP } query={ context.query } />
		</div>
	);

	next();
}

export function webServerLogs( context: PageJSContext, next: () => void ) {
	context.primary = (
		<div className="site-logs">
			<PageViewTracker path="/site-logs/:site/web" title="Sites > Logs > Web" />
			<SiteLogsDataViews logType={ LogType.WEB } query={ context.query } />
		</div>
	);

	next();
}
