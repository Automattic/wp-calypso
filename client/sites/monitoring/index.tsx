import page from '@automattic/calypso-router';
import {
	makeLayout,
	render as clientRender,
	maybeRedirectToMultiSiteDashboard,
} from 'calypso/controller';
import { setupPreferences } from 'calypso/controller/preferences';
import { siteSelection, sites, navigation } from 'calypso/my-sites/controller';
import { MONITORING } from 'calypso/sites/components/site-preview-pane/constants';
import { siteDashboard } from 'calypso/sites/controller';
import { siteMonitoring, siteMonitoringCallout } from './controller';

export default function () {
	page( '/site-monitoring', siteSelection, sites, makeLayout, clientRender );

	page(
		'/site-monitoring/:site',
		siteSelection,
		setupPreferences,
		maybeRedirectToMultiSiteDashboard(
			( params: Record< string, string > ) => `/sites/${ params.site }/monitoring`
		),
		navigation,
		siteMonitoring,
		siteMonitoringCallout,
		siteDashboard( MONITORING ),
		makeLayout,
		clientRender
	);
}
