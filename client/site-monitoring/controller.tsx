import { translate } from 'i18n-calypso';
import InlineSupportLink from 'calypso/components/inline-support-link';
import NavigationHeader from 'calypso/components/navigation-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { LogsTab } from 'calypso/my-sites/site-monitoring/logs-tab';
import { MetricsTab } from 'calypso/my-sites/site-monitoring/metrics-tab';
import type { Context as PageJSContext } from '@automattic/calypso-router';

export function siteMonitoringOverview( context: PageJSContext, next: () => void ) {
	context.primary = (
		<>
			<PageViewTracker path="/site-monitoring/:site" title="Site Monitoring" />
			<MetricsTab />
		</>
	);

	next();
}

export function siteMonitoringPhpLogs( context: PageJSContext, next: () => void ) {
	context.primary = (
		<>
			<PageViewTracker path="/site-monitoring/:site/php" title="Site Monitoring" />
			<NavigationHeader
				className="site-logs__navigation-header"
				title={ translate( 'PHP Logs' ) }
				subtitle={ translate( 'View and download PHP error logs. {{link}}Learn more.{{/link}}', {
					components: {
						link: <InlineSupportLink supportContext="site-monitoring-logs" showIcon={ false } />,
					},
				} ) }
			/>
			<LogsTab logType="php" />
		</>
	);

	next();
}

export function siteMonitoringServerLogs( context: PageJSContext, next: () => void ) {
	context.primary = (
		<>
			<PageViewTracker path="/site-monitoring/:site/web" title="Site Monitoring" />
			<NavigationHeader
				className="site-logs__navigation-header"
				title={ translate( 'Server Logs' ) }
				subtitle={ translate(
					'Gain full visibility into server activity. {{link}}Learn more.{{/link}}',
					{
						components: {
							link: <InlineSupportLink supportContext="site-monitoring-logs" showIcon={ false } />,
						},
					}
				) }
			/>
			<LogsTab logType="web" />
		</>
	);

	next();
}
