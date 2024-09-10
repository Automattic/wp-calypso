import page, { type Callback } from '@automattic/calypso-router';
import {
	makeLayout,
	render as clientRender,
	redirectToHostingPromoIfNotAtomic,
} from 'calypso/controller';
import {
	DOTCOM_LOGS_PHP,
	DOTCOM_LOGS_WEB,
} from 'calypso/hosting/sites/components/site-preview-pane/constants';
import { siteDashboard } from 'calypso/hosting/sites/controller';
import { siteSelection, sites, navigation } from 'calypso/my-sites/controller';
import { redirectHomeIfIneligible } from 'calypso/my-sites/site-monitoring/controller';
import { httpRequestLogs, phpErrorLogs } from './controller';

export default function () {
	page( '/site-logs', siteSelection, sites, makeLayout, clientRender );

	const redirectSiteLogsToPhp: Callback = ( context ) => {
		context.page.replace( `/site-logs/${ context.params.site }/php` );
	};
	page( '/site-logs/:site', redirectSiteLogsToPhp );

	page(
		'/site-logs/:site/php',
		siteSelection,
		redirectToHostingPromoIfNotAtomic,
		redirectHomeIfIneligible,
		navigation,
		phpErrorLogs,
		siteDashboard( DOTCOM_LOGS_PHP ),
		makeLayout,
		clientRender
	);
	page(
		'/site-logs/:site/web',
		siteSelection,
		redirectToHostingPromoIfNotAtomic,
		redirectHomeIfIneligible,
		navigation,
		httpRequestLogs,
		siteDashboard( DOTCOM_LOGS_WEB ),
		makeLayout,
		clientRender
	);
}
