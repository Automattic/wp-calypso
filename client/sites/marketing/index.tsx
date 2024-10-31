import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { siteSelection, sites, navigation } from 'calypso/my-sites/controller';
import { MARKETING_TOOLS } from 'calypso/sites/components/site-preview-pane/constants';
import { siteDashboard } from 'calypso/sites/controller';
import { marketingTools } from './controller';

export default function () {
	page( '/sites/marketing/tools', siteSelection, sites, makeLayout, clientRender );
	page(
		'/sites/marketing/tools/:site',
		siteSelection,
		navigation,
		marketingTools,
		siteDashboard( MARKETING_TOOLS ),
		makeLayout,
		clientRender
	);
}
