import config from '@automattic/calypso-config';
import globalPageInstance from '@automattic/calypso-router';
import { getLoggedInLandingPage } from 'calypso/lib/landing-page';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';

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
	if ( config.isEnabled( 'jetpack-cloud' ) ) {
		if ( config.isEnabled( 'oauth' ) ) {
			page.redirect( '/connect' );
			return;
		}
	}
	// We can't use page.redirect(), the login app is not loaded.
	window.location.assign( '/log-in' );
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
