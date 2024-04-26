import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { globalSiteLayout, siteSelection, sites } from 'calypso/my-sites/controller';
import { DOTCOM_OVERVIEW } from 'calypso/sites-dashboard-v2/site-preview-pane/constants';
import { hostingOverview } from './controller';

export default function () {
	page( '/hosting', siteSelection, sites, makeLayout, clientRender );
	page(
		'/hosting/:site',
		siteSelection,
		hostingOverview,
		globalSiteLayout( DOTCOM_OVERVIEW ),
		makeLayout,
		clientRender
	);
}
