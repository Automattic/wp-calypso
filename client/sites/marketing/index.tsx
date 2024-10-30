import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { siteSelection, sites, navigation } from 'calypso/my-sites/controller';
import {
	SITE_MARKETING_BUSINESS_TOOLS,
	SITE_MARKETING_TOOLS,
} from 'calypso/sites/components/site-preview-pane/constants';
import { siteDashboard } from 'calypso/sites/controller';
import { marketingTools, businessTools } from './controller';

export default function () {
	page( '/sites/marketing/tools', siteSelection, sites, makeLayout, clientRender );
	page(
		'/sites/marketing/tools/:site',
		siteSelection,
		navigation,
		marketingTools,
		siteDashboard( SITE_MARKETING_TOOLS ),
		makeLayout,
		clientRender
	);

	page( '/sites/marketing/business-tools', siteSelection, sites, makeLayout, clientRender );
	page(
		'/sites/marketing/business-tools/:site',
		siteSelection,
		navigation,
		businessTools,
		siteDashboard( SITE_MARKETING_BUSINESS_TOOLS ),
		makeLayout,
		clientRender
	);
}
