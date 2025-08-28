import page, { type Callback, type Context } from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { siteSelection, sites, navigation } from 'calypso/my-sites/controller';
import { LOGS_PHP, LOGS_WEB } from 'calypso/sites/components/site-preview-pane/constants';
import { siteDashboard } from 'calypso/sites/controller';
import { phpErrorLogs, webServerLogs, siteLogsCallout } from './controller';

export default function () {
	page( '/site-logs', siteSelection, sites, makeLayout, clientRender );

	const redirectSiteLogsToPhp: Callback = ( context: Context ) => {
		context.page.replace( `/site-logs/${ context.params.site }/php` );
	};
	page( '/site-logs/:site', redirectSiteLogsToPhp );

	page(
		'/site-logs/:site/php',
		siteSelection,
		navigation,
		phpErrorLogs,
		siteLogsCallout,
		siteDashboard( LOGS_PHP ),
		makeLayout,
		clientRender
	);
	page(
		'/site-logs/:site/web',
		siteSelection,
		navigation,
		webServerLogs,
		siteLogsCallout,
		siteDashboard( LOGS_WEB ),
		makeLayout,
		clientRender
	);
}
