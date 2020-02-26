/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import config from 'config';
import userFactory from 'lib/user';

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
		let redirectPath = '/read';

		if ( context.querystring ) {
			redirectPath += `?${ context.querystring }`;
		}

		page.redirect( redirectPath );
	} );
}
