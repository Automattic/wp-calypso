/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import config from 'calypso/config';
import userFactory from 'calypso/lib/user';
import { requestSite } from 'calypso/state/sites/actions';
import getPrimarySiteId from 'calypso/state/selectors/get-primary-site-id';
import { canCurrentUserUseCustomerHome, getSite, getSiteSlug } from 'calypso/state/sites/selectors';

export default function () {
	const user = userFactory();
	const isLoggedOut = ! user.get();
	if ( isLoggedOut ) {
		setupLoggedOut();
	} else {
		setupLoggedIn();
	}
}

function setupLoggedOut() {
	if ( config.isEnabled( 'desktop' ) ) {
		page( '/', () => {
			if ( config.isEnabled( 'oauth' ) ) {
				page.redirect( '/oauth-login' );
			} else {
				page.redirect( '/log-in' );
			}
		} );
	} else if ( config.isEnabled( 'devdocs/redirect-loggedout-homepage' ) ) {
		page( '/', () => {
			page.redirect( '/devdocs/start' );
		} );
	} else if ( config.isEnabled( 'jetpack-cloud' ) ) {
		page( '/', () => {
			if ( config.isEnabled( 'oauth' ) ) {
				page.redirect( '/connect' );
			}
		} );
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

function setupLoggedIn() {
	page( '/', async ( context ) => {
		// determine the primary site ID (it's a property of "current user" object) and then
		// ensure that the primary site info is loaded into Redux before proceeding.
		const primarySiteId = getPrimarySiteId( context.store.getState() );
		await context.store.dispatch( waitForSite( primarySiteId ) );

		const state = context.store.getState();
		const siteSlug = getSiteSlug( state, primarySiteId );
		const isCustomerHomeEnabled = canCurrentUserUseCustomerHome( state, primarySiteId );

		let redirectPath;

		if ( ! siteSlug ) {
			// there is no primary site or the site info couldn't be fetched. Redirect to Reader.
			redirectPath = '/read';
		} else if ( isCustomerHomeEnabled ) {
			redirectPath = `/home/${ siteSlug }`;
		} else {
			redirectPath = `/stats/${ siteSlug }`;
		}

		if ( context.querystring ) {
			redirectPath += `?${ context.querystring }`;
		}

		page.redirect( redirectPath );
	} );
}
