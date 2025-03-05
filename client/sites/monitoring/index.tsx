import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { siteSelection, sites, navigation } from 'calypso/my-sites/controller';
import { DOTCOM_MONITORING } from 'calypso/sites/components/site-preview-pane/constants';
import { redirectToHostingFeaturesIfNotAtomic, siteDashboard } from 'calypso/sites/controller';
import { siteMonitoring } from './controller';

export default function () {
	page( '/site-monitoring', siteSelection, sites, makeLayout, clientRender );

	page(
		'/site-monitoring/:site',
		siteSelection,
		redirectToHostingFeaturesIfNotAtomic,
		navigation,
		siteMonitoring,
		siteDashboard( DOTCOM_MONITORING ),
		makeLayout,
		clientRender
	);
}
