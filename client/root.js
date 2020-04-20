/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import config from 'config';
import userFactory from 'lib/user';
import canCurrentUserUseCustomerHome from 'state/sites/selectors/can-current-user-use-customer-home';
import getPrimarySiteId from 'state/selectors/get-primary-site-id';
import { getSiteSlug } from 'state/sites/selectors';

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
				page.redirect( '/authorize' );
			} else {
				page.redirect( '/log-in' );
			}
		} );
	} else if ( config.isEnabled( 'devdocs/redirect-loggedout-homepage' ) ) {
		page( '/', () => {
			page.redirect( '/devdocs/start' );
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

		if ( context.querystring ) {
			redirectPath += `?${ context.querystring }`;
		}

		page.redirect( redirectPath );
	} );
}
