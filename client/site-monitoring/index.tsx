import { isEnabled } from '@automattic/calypso-config';
import page, { type Callback } from '@automattic/calypso-router';
import {
	makeLayout,
	render as clientRender,
	redirectToDevToolsPromoIfNotAtomic,
} from 'calypso/controller';
import { siteSelection, sites, navigation } from 'calypso/my-sites/controller';
import { redirectHomeIfIneligible, siteMetrics } from 'calypso/my-sites/site-monitoring/controller';
import { siteDashboard } from 'calypso/sites-dashboard-v2/controller';
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
			redirectToDevToolsPromoIfNotAtomic,
			redirectHomeIfIneligible,
			navigation,
			siteMonitoringOverview,
			siteDashboard( DOTCOM_MONITORING ),
			makeLayout,
			clientRender
		);
		page(
			'/site-monitoring/:site/php',
			siteSelection,
			redirectToDevToolsPromoIfNotAtomic,
			redirectHomeIfIneligible,
			navigation,
			siteMonitoringPhpLogs,
			siteDashboard( DOTCOM_PHP_LOGS ),
			makeLayout,
			clientRender
		);
		page(
			'/site-monitoring/:site/web',
			siteSelection,
			redirectToDevToolsPromoIfNotAtomic,
			redirectHomeIfIneligible,
			navigation,
			siteMonitoringServerLogs,
			siteDashboard( DOTCOM_SERVER_LOGS ),
			makeLayout,
			clientRender
		);
	} else {
		page(
			'/site-monitoring/:siteId/:tab(php|web)?',
			siteSelection,
			redirectToDevToolsPromoIfNotAtomic,
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
