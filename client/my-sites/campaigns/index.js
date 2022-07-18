import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import { layout, marketingTools, redirectMarketingTools } from './controller';

export default function () {
	const paths = [ '/campaigns', '/campaigns/all' ];

	paths.forEach( ( path ) => page( path, ...[ siteSelection, sites, makeLayout, clientRender ] ) );

	page( '/campaigns/:domain', redirectMarketingTools );

	page(
		'/campaigns/all/:domain',
		siteSelection,
		navigation,
		marketingTools,
		layout,
		makeLayout,
		clientRender
	);
}
