import page from '@automattic/calypso-router';
import {
	makeLayout,
	render as clientRender,
	redirectToHostingPromoIfNotAtomic,
} from 'calypso/controller';
import { siteSelection, sites, navigation } from 'calypso/my-sites/controller';
import { SITE_PERFORMANCE } from 'calypso/sites/components/site-preview-pane/constants';
import { siteDashboard } from 'calypso/sites/controller';
import { sitePerformance } from './controller';

export default function () {
	page( '/sites/performance', siteSelection, sites, makeLayout, clientRender );

	page(
		'/sites/performance/:site',
		siteSelection,
		redirectToHostingPromoIfNotAtomic,
		navigation,
		sitePerformance,
		siteDashboard( SITE_PERFORMANCE ),
		makeLayout,
		clientRender
	);
}
