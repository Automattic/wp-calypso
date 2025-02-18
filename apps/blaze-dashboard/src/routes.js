import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import {
	campaignDetails,
	promoteWidget,
	promotedPosts,
	checkValidTabInNavigation,
} from 'calypso/my-sites/promote-post-i2/controller';
import { getAdvertisingDashboardPath } from 'calypso/my-sites/promote-post-i2/utils';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import { makeLayout, render as clientRender } from './page-middleware/layout';
import { setup } from './pages/controller';

import 'calypso/my-sites/promote-post-i2/style.scss';
// Needed because the placeholder component that we use doesn't import the css, webpack excludes it from the final build
// import 'calypso/blocks/site/style.scss';

const siteSelection = ( context, next ) => {
	context.store.dispatch( setSelectedSiteId( config( 'blog_id' ) ) );
	next( context, next );
};

const setupMode = ( context, next ) => {
	const setupPath = getAdvertisingDashboardPath( '/setup/' );

	// Redirect to root if setup mode is disabled and the user is trying to load the setup page
	if ( context.path?.includes( setupPath ) && ! config.isEnabled( 'blaze_setup_mode' ) ) {
		page.redirect( getAdvertisingDashboardPath( `/${ config( 'hostname' ) }` ) );
		return;
	}

	// Redirect to setup if setup mode is enabled and the user is trying load another section of the app
	if ( ! context.path?.includes( setupPath ) && config.isEnabled( 'blaze_setup_mode' ) ) {
		page.redirect( getAdvertisingDashboardPath( `/setup/${ config( 'hostname' ) }` ) );
		return;
	}

	next( context, next );
};

const blazePage = ( url, ...controller ) => {
	page( url, setupMode, ...controller, siteSelection, makeLayout, clientRender );
};

const redirectToReadyToPromote = () => {
	page.redirect( getAdvertisingDashboardPath( `/${ config( 'hostname' ) }` ) );
};

export default function ( pageBase = '/' ) {
	page.base( pageBase );

	blazePage( getAdvertisingDashboardPath( '/setup/:site' ), setup );

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
