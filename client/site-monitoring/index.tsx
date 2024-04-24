import page, { type Callback } from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { siteSelection, sites } from 'calypso/my-sites/controller';
import { redirectHomeIfIneligible } from 'calypso/my-sites/site-monitoring/controller';
import {
	siteMonitoringOverview,
	siteMonitoringPhpLogs,
	siteMonitoringServerLogs,
} from './controller';

export default function () {
	page( '/site-monitoring', siteSelection, sites, makeLayout, clientRender );
	page(
		'/site-monitoring/:site',
		siteSelection,
		redirectHomeIfIneligible,
		siteMonitoringOverview,
		makeLayout,
		clientRender
	);
	page(
		'/site-monitoring/:site/php',
		siteSelection,
		redirectHomeIfIneligible,
		siteMonitoringPhpLogs,
		makeLayout,
		clientRender
	);
	page(
		'/site-monitoring/:site/web',
		siteSelection,
		redirectHomeIfIneligible,
		siteMonitoringServerLogs,
		makeLayout,
		clientRender
	);

	// Legacy redirect for Site Logs.
	const redirectSiteLogsToMonitoring: Callback = ( context ) => {
		if ( context.params?.siteId ) {
			context.page.replace( `/site-monitoring/${ context.params.siteId }` );
		} else {
			context.page.replace( `/site-monitoring` );
		}
		return;
	};
	page( '/site-logs', redirectSiteLogsToMonitoring );
	page( '/site-logs/:siteId', redirectSiteLogsToMonitoring );
}
