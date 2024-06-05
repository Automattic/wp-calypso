import { LogsTab } from 'calypso/my-sites/site-monitoring/logs-tab';
import { LogsHeader } from './components/logs-header';
import type { Context as PageJSContext } from '@automattic/calypso-router';

export function phpErrorLogs( context: PageJSContext, next: () => void ) {
	context.primary = (
		<>
			<LogsHeader initialLogType="php" />
			<LogsTab initialLogType="php" />
		</>
	);

	next();
}

export function httpRequestLogs( context: PageJSContext, next: () => void ) {
	context.primary = (
		<>
			<LogsHeader initialLogType="web" />
			<LogsTab initialLogType="web" />
		</>
	);

	next();
}

export function siteLogs( context: PageJSContext, next: () => void ) {
	context.primary = (
		<>
			<LogsHeader initialLogType="php" />
			<LogsTab initialLogType="php" />
		</>
	);

	next();
}
