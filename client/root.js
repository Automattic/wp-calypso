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
import { getCurrentUser } from 'state/current-user/selectors';
import getPrimarySiteId from 'state/selectors/get-primary-site-id';

export default function() {
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
	page( '/', context => {
		const state = context.store.getState();
		const { primarySiteSlug } = getCurrentUser( state );
		const isCustomerHomeEnabled = canCurrentUserUseCustomerHome( state, getPrimarySiteId( state ) );
		let redirectPath =
			primarySiteSlug && isCustomerHomeEnabled ? `/home/${ primarySiteSlug }` : '/read';

		if ( context.querystring ) {
			redirectPath += `?${ context.querystring }`;
		}

		page.redirect( redirectPath );
	} );
}
