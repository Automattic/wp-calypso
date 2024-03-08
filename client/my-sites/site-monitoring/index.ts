import page, { type Callback } from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import { redirectHomeIfIneligible, siteMetrics } from './controller';

export default function () {
	page( '/site-monitoring', siteSelection, sites, makeLayout, clientRender );

	page(
		'/site-monitoring/:siteId/:tab(php|web)?',
		siteSelection,
		redirectHomeIfIneligible,
		navigation,
		siteMetrics,
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
