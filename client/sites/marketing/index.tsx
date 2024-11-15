import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { siteSelection, sites, navigation } from 'calypso/my-sites/controller';
import {
	MARKETING_TOOLS,
	MARKETING_CONNECTIONS,
	MARKETING_TRAFFIC,
	MARKETING_SHARING,
} from 'calypso/sites/components/site-preview-pane/constants';
import { siteDashboard } from 'calypso/sites/controller';
import {
	marketingConnections,
	marketingSharing,
	marketingTools,
	marketingTraffic,
} from './controller';

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

	page( '/sites/marketing/connections', siteSelection, sites, makeLayout, clientRender );
	page(
		'/sites/marketing/connections/:site',
		siteSelection,
		navigation,
		marketingConnections,
		siteDashboard( MARKETING_CONNECTIONS ),
		makeLayout,
		clientRender
	);

	page( '/sites/marketing/traffic', siteSelection, sites, makeLayout, clientRender );
	page(
		'/sites/marketing/traffic/:site',
		siteSelection,
		navigation,
		marketingTraffic,
		siteDashboard( MARKETING_TRAFFIC ),
		makeLayout,
		clientRender
	);

	page( '/sites/marketing/sharing', siteSelection, sites, makeLayout, clientRender );
	page(
		'/sites/marketing/sharing/:site',
		siteSelection,
		navigation,
		marketingSharing,
		siteDashboard( MARKETING_SHARING ),
		makeLayout,
		clientRender
	);
}
