import config from '@automattic/calypso-config';
import page from 'page';
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
	doItForMeLandingPage,
	doItForMeSiteInformationCollection,
} from './controller';

export default function () {
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

	if ( config.isEnabled( 'difm-lite-pilot' ) ) {
		paths.push( '/marketing/do-it-for-me/landing' );
		paths.push( '/marketing/do-it-for-me/site-info-lite' );
	}

	paths.forEach( ( path ) => page( path, ...[ siteSelection, sites, makeLayout, clientRender ] ) );

	page( '/marketing/connection/:service', redirectDefaultConnectionsDomain );

	page( '/sharing/:domain', redirectConnections );
	page( '/sharing/buttons/:domain', redirectSharingButtons );

	page( '/marketing/:domain', redirectMarketingTools );

	page(
		'/marketing/connections/:domain',
		siteSelection,
		navigation,
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

	page(
		'/marketing/business-tools/:domain',
		siteSelection,
		navigation,
		marketingBusinessTools,
		layout,
		makeLayout,
		clientRender
	);

	page(
		'/marketing/ultimate-traffic-guide/:domain',
		siteSelection,
		sites,
		navigation,
		ultimateTrafficGuide,
		layout,
		makeLayout,
		clientRender
	);

	if ( config.isEnabled( 'difm-lite-pilot' ) ) {
		page(
			'/marketing/do-it-for-me/landing/:domain',
			siteSelection,
			sites,
			navigation,
			doItForMeLandingPage,
			makeLayout,
			clientRender
		);
		page(
			'/marketing/do-it-for-me/site-info/:domain',
			siteSelection,
			sites,
			navigation,
			doItForMeSiteInformationCollection,
			makeLayout,
			clientRender
		);
	}
}
