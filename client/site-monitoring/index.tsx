import { isEnabled } from '@automattic/calypso-config';
import page, { type Callback } from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { siteSelection, sites, navigation } from 'calypso/my-sites/controller';
import { redirectHomeIfIneligible, siteMetrics } from 'calypso/my-sites/site-monitoring/controller';
import { sitesDashboard } from 'calypso/sites-dashboard-v2/controller';
import {
	DOTCOM_MONITORING,
	DOTCOM_PHP_LOGS,
	DOTCOM_SERVER_LOGS,
} from 'calypso/sites-dashboard-v2/site-preview-pane/constants';
import {
	siteMonitoringOverview,
	siteMonitoringPhpLogs,
	siteMonitoringServerLogs,
} from './controller';

export default function () {
	page( '/site-monitoring', siteSelection, sites, makeLayout, clientRender );

	if ( isEnabled( 'layout/dotcom-nav-redesign-v2' ) ) {
		page(
			'/site-monitoring/:site',
			siteSelection,
			redirectHomeIfIneligible,
			navigation,
			siteMonitoringOverview,
			sitesDashboard( DOTCOM_MONITORING ),
			makeLayout,
			clientRender
		);
		page(
			'/site-monitoring/:site/php',
			siteSelection,
			redirectHomeIfIneligible,
			navigation,
			siteMonitoringPhpLogs,
			sitesDashboard( DOTCOM_PHP_LOGS ),
			makeLayout,
			clientRender
		);
		page(
			'/site-monitoring/:site/web',
			siteSelection,
			redirectHomeIfIneligible,
			navigation,
			siteMonitoringServerLogs,
			sitesDashboard( DOTCOM_SERVER_LOGS ),
			makeLayout,
			clientRender
		);
	} else {
		page(
			'/site-monitoring/:siteId/:tab(php|web)?',
			siteSelection,
			redirectHomeIfIneligible,
			navigation,
			siteMetrics,
			makeLayout,
			clientRender
		);
	}

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
