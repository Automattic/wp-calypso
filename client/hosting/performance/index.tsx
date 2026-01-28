import page from '@automattic/calypso-router';
import {
	makeLayout,
	render as clientRender,
	maybeRedirectToMultiSiteDashboard,
} from 'calypso/controller';
import { setupPreferences } from 'calypso/controller/preferences';
import { siteSelection, sites, navigation } from 'calypso/my-sites/controller';
import { PERFORMANCE } from 'calypso/sites/components/site-preview-pane/constants';
import { siteDashboard } from 'calypso/sites/controller';
import { sitePerformance, sitePerformanceCallout } from './controller';

export default function () {
	page( '/sites/performance', siteSelection, sites, makeLayout, clientRender );

	page(
		'/sites/performance/:site',
		siteSelection,
		setupPreferences,
		maybeRedirectToMultiSiteDashboard(
			( params: Record< string, string > ) => `/sites/${ params.site }/performance`
		),
		navigation,
		sitePerformance,
		sitePerformanceCallout,
		siteDashboard( PERFORMANCE ),
		makeLayout,
		clientRender
	);
}
