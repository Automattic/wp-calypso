/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import config from 'calypso/config';
import userFactory from 'calypso/lib/user';
import canCurrentUserUseCustomerHome from 'calypso/state/sites/selectors/can-current-user-use-customer-home';
import getPrimarySiteId from 'calypso/state/selectors/get-primary-site-id';
import { getSiteSlug, isJetpackSite } from 'calypso/state/sites/selectors';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';

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

function setupLoggedIn() {
	page( '/', ( context ) => {
		const state = context.store.getState();
		const primarySiteId = getPrimarySiteId( state );
		const isCustomerHomeEnabled = canCurrentUserUseCustomerHome( state, primarySiteId );
		const siteSlug = getSiteSlug( state, primarySiteId );
		let redirectPath = siteSlug && isCustomerHomeEnabled ? `/home/${ siteSlug }` : '/read';

		if ( isJetpackSite( state, primarySiteId ) && ! isAtomicSite( state, primarySiteId ) ) {
			redirectPath = `/stats/${ siteSlug }`;
		}

		if ( context.querystring ) {
			redirectPath += `?${ context.querystring }`;
		}

		page.redirect( redirectPath );
	} );
}
