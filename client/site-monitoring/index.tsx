import page from '@automattic/calypso-router';
import {
	makeLayout,
	render as clientRender,
	redirectToHostingPromoIfNotAtomic,
} from 'calypso/controller';
import { siteSelection, sites, navigation } from 'calypso/my-sites/controller';
import { redirectHomeIfIneligible } from 'calypso/my-sites/site-monitoring/controller';
import { siteDashboard } from 'calypso/sites-dashboard-v2/controller';
import { DOTCOM_MONITORING } from 'calypso/sites-dashboard-v2/site-preview-pane/constants';
import { siteMonitoring } from './controller';

export default function () {
	page( '/site-monitoring', siteSelection, sites, makeLayout, clientRender );

	page(
		'/site-monitoring/:site',
		siteSelection,
		redirectToHostingPromoIfNotAtomic,
		redirectHomeIfIneligible,
		navigation,
		siteMonitoring,
		siteDashboard( DOTCOM_MONITORING ),
		makeLayout,
		clientRender
	);
}
