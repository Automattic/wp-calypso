import page, { type Callback, type Context } from '@automattic/calypso-router';
import {
	makeLayout,
	render as clientRender,
	maybeRedirectToMultiSiteDashboard,
} from 'calypso/controller';
import { setupPreferences } from 'calypso/controller/preferences';
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
		setupPreferences,
		maybeRedirectToMultiSiteDashboard(
			( params: Record< string, string > ) => `/sites/${ params.site }/logs/php`
		),
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
		setupPreferences,
		maybeRedirectToMultiSiteDashboard(
			( params: Record< string, string > ) => `/sites/${ params.site }/logs/server`
		),
		navigation,
		webServerLogs,
		siteLogsCallout,
		siteDashboard( LOGS_WEB ),
		makeLayout,
		clientRender
	);
}
