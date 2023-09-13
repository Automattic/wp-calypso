import config from '@automattic/calypso-config';
import page from 'page';
import {
	campaignDetails,
	promoteWidget,
	promotedPosts,
	checkValidTabInNavigation,
} from 'calypso/my-sites/promote-post-i2/controller';
import { getAdvertisingDashboardPath } from 'calypso/my-sites/promote-post-i2/utils';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import { makeLayout, render as clientRender } from './page-middleware/layout';

import 'calypso/my-sites/promote-post-i2/style.scss';
// Needed because the placeholder component that we use doesn't import the css, webpack excludes it from the final build
import 'calypso/blocks/site/style.scss';

const siteSelection = ( context, next ) => {
	context.store.dispatch( setSelectedSiteId( config( 'blog_id' ) ) );
	next( context, next );
};

const blazePage = ( url, ...controller ) => {
	page( url, ...controller, siteSelection, makeLayout, clientRender );
};

const redirectToReadyToPromote = () => {
	page.redirect( getAdvertisingDashboardPath( `/${ config( 'hostname' ) }` ) );
};

export default function ( pageBase = '/' ) {
	page.base( pageBase );

	blazePage( getAdvertisingDashboardPath( '/:site' ), promotedPosts );

	blazePage(
		getAdvertisingDashboardPath( '/:tab/:site' ),
		checkValidTabInNavigation,
		promotedPosts
	);

	blazePage( getAdvertisingDashboardPath( '/campaigns/:campaignId/:site' ), campaignDetails );

	blazePage( getAdvertisingDashboardPath( '/promote/:item/:site' ), promoteWidget );

	blazePage( getAdvertisingDashboardPath( '/:tab/promote/:item/:site' ), promoteWidget );

	// Compatibility: Redirects to new navigation style
	page( getAdvertisingDashboardPath( '/:site/:tab/promote/:item' ), ( { params } ) => {
		const { site, tab, item } = params;
		page.redirect( getAdvertisingDashboardPath( `/${ tab }/promote/${ item }/${ site }` ) );
	} );

	// Anything else should redirect to default advertising dashboard page
	blazePage( '*', redirectToReadyToPromote );

	// Enable hashbang for routing in Jetpack.
	page( { hashbang: true } );
}
