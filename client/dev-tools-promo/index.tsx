import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import { siteDashboard } from 'calypso/sites-dashboard-v2/controller';
import { DOTCOM_OVERVIEW } from 'calypso/sites-dashboard-v2/site-preview-pane/constants';
import { devToolsPromo } from './controller';

export default function () {
	page( '/dev-tools-promo', siteSelection, sites, makeLayout, clientRender );
	page(
		'/dev-tools-promo/:site',
		siteSelection,
		navigation,
		devToolsPromo,
		siteDashboard( DOTCOM_OVERVIEW ),
		makeLayout,
		clientRender
	);
}
