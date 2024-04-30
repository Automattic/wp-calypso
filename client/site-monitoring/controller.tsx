import SiteMonitoringPhpLogs from './components/php-logs';
import SiteMonitoringServerLogs from './components/server-logs';
import SiteMonitoringOverview from './components/site-monitoring-overview';
import type { Context as PageJSContext } from '@automattic/calypso-router';

export function siteMonitoringOverview( context: PageJSContext, next: () => void ) {
	context.primary = <SiteMonitoringOverview />;

	next();
}

export function siteMonitoringPhpLogs( context: PageJSContext, next: () => void ) {
	context.primary = <SiteMonitoringPhpLogs />;

	next();
}

export function siteMonitoringServerLogs( context: PageJSContext, next: () => void ) {
	context.primary = <SiteMonitoringServerLogs />;

	next();
}
