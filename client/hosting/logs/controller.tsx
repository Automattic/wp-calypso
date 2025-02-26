import { LogType } from 'calypso/data/hosting/use-site-logs-query';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { SiteLogsDataViews } from 'calypso/sites/tools/logs';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import type { Context as PageJSContext, Callback } from '@automattic/calypso-router';

export function phpErrorLogs( context: PageJSContext, next: () => void ) {
	context.primary = (
		<div className="site-logs">
			<PageViewTracker path="/site-logs/:site/php" title="PHP Error Logs" />
			<SiteLogsDataViews logType={ LogType.PHP } query={ context.query } />
		</div>
	);

	next();
}

export function webServerLogs( context: PageJSContext, next: () => void ) {
	context.primary = (
		<div className="site-logs">
			<PageViewTracker path="/site-logs/:site/web" title="Web Server Logs" />
			<SiteLogsDataViews logType={ LogType.WEB } query={ context.query } />
		</div>
	);

	next();
}

export const redirectHomeIfIneligible: Callback = ( context, next ) => {
	const state = context.store.getState();
	const site = getSelectedSite( state );
	const isAtomicSite = !! site?.is_wpcom_atomic || !! site?.is_wpcom_staging_site;

	if ( ! isAtomicSite ) {
		context.page.replace( `/overview/${ site?.slug }` );
		return;
	}
	next();
};
