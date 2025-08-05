import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { siteSelection, sites, navigation } from 'calypso/my-sites/controller';
import { PERFORMANCE } from 'calypso/sites/components/site-preview-pane/constants';
import { redirectToHostingFeaturesIfNotAtomic, siteDashboard } from 'calypso/sites/controller';
import { sitePerformance, sitePerformanceCallout } from './controller';

export default function () {
	page( '/sites/performance', siteSelection, sites, makeLayout, clientRender );

	page(
		'/sites/performance/:site',
		siteSelection,
		redirectToHostingFeaturesIfNotAtomic,
		navigation,
		sitePerformance,
		sitePerformanceCallout,
		siteDashboard( PERFORMANCE ),
		makeLayout,
		clientRender
	);
}
