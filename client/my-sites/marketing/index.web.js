import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import {
	connections,
	layout,
	marketingTools,
	redirectConnections,
	redirectDefaultConnectionsDomain,
	redirectMarketingTools,
	marketingBusinessTools,
	redirectSharingButtons,
	sharingButtons,
	traffic,
	ultimateTrafficGuide,
} from './controller';

export default function ( router ) {
	const paths = [
		'/marketing',
		'/marketing/connections',
		'/marketing/sharing-buttons',
		'/marketing/tools',
		'/marketing/traffic',
		'/marketing/ultimate-traffic-guide',
		'/sharing',
		'/sharing/buttons',
		'/marketing/business-tools',
	];

	paths.forEach( ( path ) =>
		router( path, ...[ siteSelection, sites, makeLayout, clientRender ] )
	);

	router( '/marketing/connection/:service', redirectDefaultConnectionsDomain );

	router( '/sharing/:domain', redirectConnections );
	router( '/sharing/buttons/:domain', redirectSharingButtons );

	router( '/marketing/:domain', redirectMarketingTools );

	router(
		'/marketing/connections/:domain',
		siteSelection,
		navigation,
		connections,
		layout,
		makeLayout,
		clientRender
	);

	router(
		'/marketing/traffic/:domain',
		siteSelection,
		navigation,
		traffic,
		layout,
		makeLayout,
		clientRender
	);

	router(
		'/marketing/sharing-buttons/:domain',
		siteSelection,
		navigation,
		sharingButtons,
		layout,
		makeLayout,
		clientRender
	);

	router(
		'/marketing/tools/:domain',
		siteSelection,
		navigation,
		marketingTools,
		layout,
		makeLayout,
		clientRender
	);

	router(
		'/marketing/business-tools/:domain',
		siteSelection,
		navigation,
		marketingBusinessTools,
		layout,
		makeLayout,
		clientRender
	);

	router(
		'/marketing/ultimate-traffic-guide/:domain',
		siteSelection,
		sites,
		navigation,
		ultimateTrafficGuide,
		layout,
		makeLayout,
		clientRender
	);
}
