import config from '@automattic/calypso-config';
import globalPageInstance from '@automattic/calypso-router';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { fetchPreferences } from 'calypso/state/preferences/actions';
import { hasReceivedRemotePreferences } from 'calypso/state/preferences/selectors';
import getIsSubscriptionOnly from 'calypso/state/selectors/get-is-subscription-only';
import getPrimarySiteId from 'calypso/state/selectors/get-primary-site-id';
import { requestSite } from 'calypso/state/sites/actions';
import {
	canCurrentUserUseCustomerHome,
	getSite,
	getSiteSlug,
	getSiteAdminUrl,
	isAdminInterfaceWPAdmin,
} from 'calypso/state/sites/selectors';
import { hasReadersAsLandingPage } from 'calypso/state/sites/selectors/has-reader-as-landing-page';
import { hasSitesAsLandingPage } from 'calypso/state/sites/selectors/has-sites-as-landing-page';
import { getSelectedSiteId } from './state/ui/selectors';

/**
 * @param clientRouter Unused. We can't use the isomorphic router because we want to do redirects.
 * @param page Used to create isolated unit tests. Default behaviour uses the global 'page' router.
 */
export default function ( clientRouter, page = globalPageInstance ) {
	page( '/', ( context ) => {
		const isLoggedIn = isUserLoggedIn( context.store.getState() );
		if ( isLoggedIn ) {
			handleLoggedIn( page, context );
		} else {
			handleLoggedOut( page );
		}
	} );
}

function handleLoggedOut( page ) {
	if ( config.isEnabled( 'devdocs/redirect-loggedout-homepage' ) ) {
		page.redirect( '/devdocs/start' );
	} else if ( config.isEnabled( 'jetpack-cloud' ) ) {
		if ( config.isEnabled( 'oauth' ) ) {
			page.redirect( '/connect' );
		}
	}
}

async function handleLoggedIn( page, context ) {
	let redirectPath = await getLoggedInLandingPage( context.store );

	if ( context.querystring ) {
		redirectPath += `?${ context.querystring }`;
	}

	if ( redirectPath.startsWith( '/' ) ) {
		page.redirect( redirectPath );
	} else {
		// Case for wp-admin redirection when primary site has classic admin interface.
		window.location.assign( redirectPath );
	}
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
	await dispatch( waitForPrefs() );
	const useSitesAsLandingPage = hasSitesAsLandingPage( getState() );

	if ( useSitesAsLandingPage ) {
		return '/sites';
	}

	const useReaderAsLandingPage = hasReadersAsLandingPage( getState() );

	if ( useReaderAsLandingPage ) {
		return '/reader';
	}

	// determine the primary site ID (it's a property of "current user" object) and then
	// ensure that the primary site info is loaded into Redux before proceeding.
	const primaryOrSelectedSiteId = getSelectedSiteId( getState() ) || getPrimarySiteId( getState() );
	await dispatch( waitForSite( primaryOrSelectedSiteId ) );
	const primarySiteSlug = getSiteSlug( getState(), primaryOrSelectedSiteId );

	if ( ! primarySiteSlug ) {
		if ( getIsSubscriptionOnly( getState() ) ) {
			return '/reader';
		}
		// there is no primary site or the site info couldn't be fetched. Redirect to Sites Dashboard.
		return '/sites';
	}

	const isCustomerHomeEnabled = canCurrentUserUseCustomerHome(
		getState(),
		primaryOrSelectedSiteId
	);

	if ( isCustomerHomeEnabled ) {
		if ( isAdminInterfaceWPAdmin( getState(), primaryOrSelectedSiteId ) ) {
			// This URL starts with 'https://' because it's the access to wp-admin.
			return getSiteAdminUrl( getState(), primaryOrSelectedSiteId );
		}
		return `/home/${ primarySiteSlug }`;
	}

	return `/stats/day/${ primarySiteSlug }`;
}
