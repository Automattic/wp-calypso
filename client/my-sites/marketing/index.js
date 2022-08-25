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
} from './controller';

export default function () {
	page( '/marketing/do-it-for-me*', function redirectToDIFMLandingPage() {
		window.location.replace( 'https://wordpress.com/do-it-for-me' );
	} );

	page( '/marketing/ultimate-traffic-guide*', function redirectToWPCoursesPage() {
		window.location.replace(
			'https://wpcourses.com/course/intro-to-search-engine-optimization-seo/'
		);
	} );

	const paths = [
		'/marketing',
		'/marketing/connections',
		'/marketing/sharing-buttons',
		'/marketing/tools',
		'/marketing/traffic',
		'/sharing',
		'/sharing/buttons',
		'/marketing/business-tools',
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
}
