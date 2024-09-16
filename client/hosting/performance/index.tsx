import page from '@automattic/calypso-router';
import {
	makeLayout,
	render as clientRender,
	redirectToHostingPromoIfNotAtomic,
} from 'calypso/controller';
import { DOTCOM_SITE_PERFORMANCE } from 'calypso/hosting/sites/components/site-preview-pane/constants';
import { siteDashboard } from 'calypso/hosting/sites/controller';
import { siteSelection, sites, navigation } from 'calypso/my-sites/controller';
import { sitePerformance } from './controller';

export default function () {
	page( '/site-performance', siteSelection, sites, makeLayout, clientRender );

	page(
		'/site-performance/:site',
		siteSelection,
		redirectToHostingPromoIfNotAtomic,
		navigation,
		sitePerformance,
		siteDashboard( DOTCOM_SITE_PERFORMANCE ),
		makeLayout,
		clientRender
	);
}
