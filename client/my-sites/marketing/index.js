import page from '@automattic/calypso-router';
import { localizeUrl } from '@automattic/i18n-utils';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import {
	connections,
	layout,
	redirectConnections,
	redirectDefaultConnectionsDomain,
	redirectHome,
	redirectSharingButtons,
	sharingButtons,
	traffic,
	activitypub,
} from './controller';

export default function () {
	page( '/marketing/do-it-for-me*', function redirectToDIFMLandingPage() {
		window.location.replace( 'https://wordpress.com/website-design-service/' );
	} );

	page( '/marketing/ultimate-traffic-guide*', function redirectToWPCoursesPage() {
		window.location.replace( localizeUrl( 'https://wordpress.com/support/courses/seo/' ) );
	} );

	// The Marketing page is gone, so everything that pointed at it lands on My
	// Home instead. These are registered before '/marketing/:domain' so the
	// literal segments win over the site-slug parameter.
	page( '/marketing/tools', redirectHome );
	page( '/marketing/tools/:domain', redirectHome );
	page( '/marketing/business-tools/:domain', redirectHome );
	page( '/marketing', redirectHome );

	const paths = [
		'/marketing/activitypub',
		'/marketing/connections',
		'/marketing/sharing-buttons',
		'/marketing/traffic',
		'/sharing',
		'/sharing/buttons',
	];

	paths.forEach( ( path ) => page( path, ...[ siteSelection, sites, makeLayout, clientRender ] ) );

	page( '/marketing/connection/:service', redirectDefaultConnectionsDomain );

	page( '/sharing/:domain', redirectConnections );
	page( '/sharing/buttons/:domain', redirectSharingButtons );

	page( '/marketing/:domain', redirectHome );
	page( '/marketing/activitypub/:domain', siteSelection, activitypub );

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
}
