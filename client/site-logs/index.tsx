import page, { type Callback } from '@automattic/calypso-router';
import {
	makeLayout,
	render as clientRender,
	redirectToDevToolsPromoIfNotAtomic,
} from 'calypso/controller';
import { siteSelection, sites, navigation } from 'calypso/my-sites/controller';
import { redirectHomeIfIneligible } from 'calypso/my-sites/site-monitoring/controller';
import { siteDashboard } from 'calypso/sites-dashboard-v2/controller';
import { DOTCOM_LOGS } from 'calypso/sites-dashboard-v2/site-preview-pane/constants';
import { httpRequestLogs, phpErrorLogs, siteLogs } from './controller';

export default function () {
	page( '/site-logs', siteSelection, sites, makeLayout, clientRender );

	// const redirectSiteLogsToPhp: Callback = ( context ) => {
	// 	console.log( 'redirectSiteLogsToPhp:', context );
	// 	let redirectTo = `/site-logs/${ context.params.site }/php`;
	// 	if ( context?.page?.prevContext?.path.endsWith( '/web' ) ) {
	// 		redirectTo = `/site-logs/${ context.params.site }/web`;
	// 	}
	// 	context.page.replace( redirectTo );
	// };
	//page( '/site-logs/:site', redirectSiteLogsToPhp );
	page(
		'/site-logs/:site',
		siteSelection,
		redirectToDevToolsPromoIfNotAtomic,
		redirectHomeIfIneligible,
		navigation,
		siteLogs,
		siteDashboard( DOTCOM_LOGS ),
		makeLayout,
		clientRender
	);

	page(
		'/site-logs/:site/php',
		siteSelection,
		redirectToDevToolsPromoIfNotAtomic,
		redirectHomeIfIneligible,
		navigation,
		phpErrorLogs,
		siteDashboard( DOTCOM_LOGS ),
		makeLayout,
		clientRender
	);
	page(
		'/site-logs/:site/web',
		siteSelection,
		redirectToDevToolsPromoIfNotAtomic,
		redirectHomeIfIneligible,
		navigation,
		httpRequestLogs,
		siteDashboard( DOTCOM_LOGS ),
		makeLayout,
		clientRender
	);
}
