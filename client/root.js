import config from '@automattic/calypso-config';
import page from 'page';
import { isUserLoggedIn, getCurrentUser } from 'calypso/state/current-user/selectors';
import { fetchPreferences, savePreference } from 'calypso/state/preferences/actions';
import { getPreference, hasReceivedRemotePreferences } from 'calypso/state/preferences/selectors';
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
	// Testing code. Remove before merging.
	// Usage:
	//    Go to `/?sites-landing-page=true` or `/?sites-landing-page=false` to set the preference.
	if ( new URLSearchParams( context.querystring ).has( 'sites-landing-page' ) ) {
		context.store.dispatch(
			savePreference( 'sites-landing-page', {
				useSitesAsLandingPage:
					new URLSearchParams( context.querystring ).get( 'sites-landing-page' ) === 'true',
				updatedAt: Date.now(),
			} )
		);
	}

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

// Helper thunk that ensures that the user preferences has been fetched into Redux state before we
// continue working with it.
const waitForPrefs = () => async ( dispatch, getState ) => {
	if ( hasReceivedRemotePreferences( getState() ) ) {
		return;
	}

	try {
		await dispatch( fetchPreferences() );
	} catch {
		// if the fetching of preferences fails, return gracefully and proceed to the next landing page candidate
	}
};

async function getLoggedInLandingPage( { dispatch, getState } ) {
	if ( config.isEnabled( 'sites-as-landing-page' ) ) {
		await dispatch( waitForPrefs() );
		const useSitesAsLandingPage = getPreference(
			getState(),
			'sites-landing-page'
		)?.useSitesAsLandingPage;

		const siteCount = getCurrentUser( getState() )?.site_count;

		if ( useSitesAsLandingPage && siteCount > 1 ) {
			return '/sites';
		}
	}

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
