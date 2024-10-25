import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { siteSelection, sites, navigation } from 'calypso/my-sites/controller';
import {
	SITE_MARKETING_BUSINESS_TOOLS,
	SITE_MARKETING_TOOLS,
	SITE_MARKETING_CONNECTIONS,
	SITE_MARKETING_TRAFFIC,
	SITE_MARKETING_SHARING_BUTTONS,
} from 'calypso/sites/components/site-preview-pane/constants';
import { siteDashboard } from 'calypso/sites/controller';
import { marketingTools, businessTools, connections, traffic, sharingButtons } from './controller';

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

	page( '/sites/marketing/connections', siteSelection, sites, makeLayout, clientRender );
	page(
		'/sites/marketing/connections/:site',
		siteSelection,
		navigation,
		connections,
		siteDashboard( SITE_MARKETING_CONNECTIONS ),
		makeLayout,
		clientRender
	);

	page( '/sites/marketing/traffic', siteSelection, sites, makeLayout, clientRender );
	page(
		'/sites/marketing/traffic/:site',
		siteSelection,
		navigation,
		traffic,
		siteDashboard( SITE_MARKETING_TRAFFIC ),
		makeLayout,
		clientRender
	);

	page( '/sites/marketing/sharing-buttons', siteSelection, sites, makeLayout, clientRender );
	page(
		'/sites/marketing/sharing-buttons/:site',
		siteSelection,
		navigation,
		sharingButtons,
		siteDashboard( SITE_MARKETING_SHARING_BUTTONS ),
		makeLayout,
		clientRender
	);
}
