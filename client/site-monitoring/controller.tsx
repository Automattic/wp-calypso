import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { LogsTab } from 'calypso/my-sites/site-monitoring/logs-tab';
import { MetricsTab } from 'calypso/my-sites/site-monitoring/metrics-tab';
import type { Context as PageJSContext } from '@automattic/calypso-router';

export function siteMonitoringOverview( context: PageJSContext, next: () => void ) {
	context.primary = (
		<div className="site-monitoring-overview">
			<PageViewTracker path="/site-monitoring/:site" title="Site Monitoring" />
			<MetricsTab />
		</div>
	);

	next();
}

export function siteMonitoringPhpLogs( context: PageJSContext, next: () => void ) {
	context.primary = (
		<div className="site-monitoring-php-logs">
			<PageViewTracker path="/site-monitoring/:site/php" title="Site Monitoring" />
			<LogsTab logType="php" />
		</div>
	);

	next();
}

export function siteMonitoringServerLogs( context: PageJSContext, next: () => void ) {
	context.primary = (
		<div className="site-monitoring-server-logs">
			<PageViewTracker path="/site-monitoring/:site/web" title="Site Monitoring" />
			<LogsTab logType="web" />
		</div>
	);

	next();
}
