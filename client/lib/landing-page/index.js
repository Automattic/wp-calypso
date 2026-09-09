import pageRouter from '@automattic/calypso-router';
import { dashboardLink } from 'calypso/dashboard/utils/link';
import { bumpStat } from 'calypso/lib/analytics/mc';
import { hasDashboardOptIn } from 'calypso/state/dashboard/selectors';
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

const getSitesLink = ( isDashboardOptIn ) => {
	bumpStat( 'landing-page', 'sites' );

	if ( isDashboardOptIn ) {
		bumpStat( 'dashboard-redirect', 'landing-page' );
		return dashboardLink( '/sites' );
	}

	return '/sites';
};

// Resolves the account's normal landing destination. Needs a booted Calypso store.
export async function getLoggedInLandingPage( { dispatch, getState } ) {
	await dispatch( waitForPrefs() );
	const useSitesAsLandingPage = hasSitesAsLandingPage( getState() );
	const dashboardOptIn = hasDashboardOptIn( getState() );

	if ( useSitesAsLandingPage ) {
		return getSitesLink( dashboardOptIn );
	}

	const useReaderAsLandingPage = hasReadersAsLandingPage( getState() );

	if ( useReaderAsLandingPage ) {
		bumpStat( 'landing-page', 'reader' );
		return '/reader';
	}

	// determine the primary site ID (it's a property of "current user" object) and then
	// ensure that the primary site info is loaded into Redux before proceeding.
	const primarySiteId = getPrimarySiteId( getState() );
	await dispatch( waitForSite( primarySiteId ) );
	const primarySiteSlug = getSiteSlug( getState(), primarySiteId );

	if ( ! primarySiteSlug ) {
		if ( getIsSubscriptionOnly( getState() ) ) {
			bumpStat( 'landing-page', 'reader' );
			return '/reader';
		}

		// there is no primary site or the site info couldn't be fetched. Redirect to Sites Dashboard.
		return getSitesLink( dashboardOptIn );
	}

	const isCustomerHomeEnabled = canCurrentUserUseCustomerHome( getState(), primarySiteId );

	if ( isCustomerHomeEnabled ) {
		if ( isAdminInterfaceWPAdmin( getState(), primarySiteId ) ) {
			bumpStat( 'landing-page', 'wp-admin' );
			return getSiteAdminUrl( getState(), primarySiteId );
		}
		bumpStat( 'landing-page', 'customer-home' );
		return `/home/${ primarySiteSlug }`;
	}

	bumpStat( 'landing-page', 'stats' );
	return `/stats/day/${ primarySiteSlug }`;
}

// Absolute wp-admin URLs can't go through the in-app router.
/**
 * @param {{ dispatch: Function, getState: Function }} store
 * @param {( destination: string ) => void} [navigate]
 */
export async function goToLandingPage( store, navigate = pageRouter ) {
	const destination = await getLoggedInLandingPage( store );

	if ( destination.startsWith( '/' ) ) {
		navigate( destination );
	} else {
		window.location.assign( destination );
	}
}

// Thunk form, for connected components and anything holding a `dispatch`.
export const navigateToLandingPage = () => ( dispatch, getState ) =>
	goToLandingPage( { dispatch, getState } );
