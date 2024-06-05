import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { LogsTab } from 'calypso/my-sites/site-monitoring/logs-tab';
import { LogsHeader } from './components/logs-header';
import type { Context as PageJSContext } from '@automattic/calypso-router';

export function phpErrorLogs( context: PageJSContext, next: () => void ) {
	context.primary = (
		<>
			<PageViewTracker path="/site-logs/:site/php" title="PHP Error Logs" />
			<LogsHeader logType="php" />
			<LogsTab logType="php" />
		</>
	);

	next();
}

export function httpRequestLogs( context: PageJSContext, next: () => void ) {
	context.primary = (
		<>
			<PageViewTracker path="/site-logs/:site/web" title="Web Server Logs" />
			<LogsHeader logType="web" />
			<LogsTab logType="web" />
		</>
	);

	next();
}

export function siteLogs( context: PageJSContext, next: () => void ) {
	const state = context.store.getState();
	console.log( 'siteLogs', context, state );
	context.primary = (
		<>
			<PageViewTracker path="/site-logs/:site/php" title="PHP Error Logs" />
			<LogsHeader logType="php" />
			<LogsTab logType="php" />
		</>
	);

	next();
}
