import page, { type Callback } from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { siteSelection, sites, navigation } from 'calypso/my-sites/controller';
import {
	DOTCOM_MARKETING_BUSINESS_TOOLS,
	DOTCOM_MARKETING_TOOLS,
} from 'calypso/sites/components/site-preview-pane/constants';
import { siteDashboard } from 'calypso/sites/controller';
import { marketingTools, businessTools } from './controller';

export default function () {
	page( '/sites/marketing', siteSelection, sites, makeLayout, clientRender );

	const redirectWoy: Callback = ( context ) => {
		context.page.replace( `/sites/marketing/tools/${ context.params.site }` );
	};
	page( '/sites/marketing/:site', redirectWoy );

	page(
		'/sites/marketing/tools/:site',
		siteSelection,
		navigation,
		marketingTools,
		siteDashboard( DOTCOM_MARKETING_TOOLS ),
		makeLayout,
		clientRender
	);

	page(
		'/sites/marketing/business-tools/:site',
		siteSelection,
		navigation,
		businessTools,
		siteDashboard( DOTCOM_MARKETING_BUSINESS_TOOLS ),
		makeLayout,
		clientRender
	);
}
