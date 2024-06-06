import page from '@automattic/calypso-router';
import {
	makeLayout,
	render as clientRender,
	redirectToDevToolsPromoIfNotAtomic,
} from 'calypso/controller';
import { siteSelection, sites, navigation } from 'calypso/my-sites/controller';
import { redirectHomeIfIneligible, redirectSiteLogs } from 'calypso/my-sites/site-monitoring/controller';
import { siteDashboard } from 'calypso/sites-dashboard-v2/controller';
import { DOTCOM_LOGS } from 'calypso/sites-dashboard-v2/site-preview-pane/constants';
import { httpRequestLogs, phpErrorLogs } from './controller';

export default function () {
	page( '/site-logs', siteSelection, sites, makeLayout, clientRender );

	page( '/site-logs/:site', redirectSiteLogs );

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
