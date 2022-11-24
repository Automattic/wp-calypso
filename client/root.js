import config from '@automattic/calypso-config';
import page from 'page';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import getPrimarySiteId from 'calypso/state/selectors/get-primary-site-id';
import { requestSite } from 'calypso/state/sites/actions';
import { canCurrentUserUseCustomerHome, getSite, getSiteSlug } from 'calypso/state/sites/selectors';

export default function () {
	page( '/', ( context ) => {
		const isLoggedIn = isUserLoggedIn( context.store.getState() );
		if ( isLoggedIn ) {
			handleLoggedIn( context );
		} else {
			handleLoggedOut();
		}
	} );
}

function handleLoggedOut() {
	if ( config.isEnabled( 'devdocs/redirect-loggedout-homepage' ) ) {
		page.redirect( '/devdocs/start' );
	} else if ( config.isEnabled( 'jetpack-cloud' ) ) {
		if ( config.isEnabled( 'oauth' ) ) {
			page.redirect( '/connect' );
		}
	}
}

async function handleLoggedIn( context ) {
	let redirectPath = await getLoggedInLandingPage( context.store );

	if ( context.querystring ) {
		redirectPath += `?${ context.querystring }`;
	}

	page.redirect( redirectPath );
}

// Helper thunk that ensures that the requested site info is fetched into Redux state before we
// continue working with it.
// The `siteSelection` handler in `my-sites/controller` contains similar code.
const waitForSite = ( siteId ) => async ( dispatch, getState ) => {
	if ( getSite( getState(), siteId ) ) {
		return;
	}

	try {
		await dispatch( requestSite( siteId ) );
	} catch {
		// if the fetching of site info fails, return gracefully and proceed to redirect to Reader
	}
};

async function getLoggedInLandingPage( { dispatch, getState } ) {
	// determine the primary site ID (it's a property of "current user" object) and then
	// ensure that the primary site info is loaded into Redux before proceeding.
	const primarySiteId = getPrimarySiteId( getState() );
	await dispatch( waitForSite( primarySiteId ) );

	const primarySiteSlug = getSiteSlug( getState(), primarySiteId );

	if ( ! primarySiteSlug ) {
		// there is no primary site or the site info couldn't be fetched. Redirect to Reader.
		return '/read';
	}

	const isCustomerHomeEnabled = canCurrentUserUseCustomerHome( getState(), primarySiteId );

	if ( isCustomerHomeEnabled ) {
		return `/home/${ primarySiteSlug }`;
	}

	return `/stats/${ primarySiteSlug }`;
}
