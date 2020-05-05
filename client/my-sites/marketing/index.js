/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { jetpackModuleActive, navigation, siteSelection, sites } from 'my-sites/controller';
import {
	connections,
	layout,
	marketingTools,
	redirectConnections,
	redirectDefaultConnectionsDomain,
	redirectMarketingTools,
	redirectSharingButtons,
	sharingButtons,
	traffic,
} from './controller';
import { makeLayout, render as clientRender } from 'controller';

export default function () {
	const paths = [
		'/marketing',
		'/marketing/connections',
		'/marketing/sharing-buttons',
		'/marketing/tools',
		'/marketing/traffic',
		'/sharing',
		'/sharing/buttons',
	];

	paths.forEach( ( path ) => page( path, ...[ siteSelection, sites, makeLayout, clientRender ] ) );

	page( '/marketing/connection/:service', redirectDefaultConnectionsDomain );

	page( '/sharing/:domain', redirectConnections );
	page( '/sharing/buttons/:domain', redirectSharingButtons );

	page( '/marketing/:domain', redirectMarketingTools );

	page(
		'/marketing/connections/:domain',
		siteSelection,
		navigation,
		jetpackModuleActive( 'publicize', false ),
		connections,
		layout,
		makeLayout,
		clientRender
	);

	page(
		'/marketing/traffic/:domain',
		siteSelection,
		navigation,
		traffic,
		layout,
		makeLayout,
		clientRender
	);

	page(
		'/marketing/sharing-buttons/:domain',
		siteSelection,
		navigation,
		jetpackModuleActive( 'sharedaddy' ),
		sharingButtons,
		layout,
		makeLayout,
		clientRender
	);

	page(
		'/marketing/tools/:domain',
		siteSelection,
		navigation,
		marketingTools,
		layout,
		makeLayout,
		clientRender
	);
}
