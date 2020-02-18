/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import config from 'config';
import { abtest } from 'lib/abtest';
import userFactory from 'lib/user';

export default function() {
	// TODO: Remove Jetpack Cloud specific logic when root route is no longer handled by the reader section
	const jetpackCloudEnvs = [
		'jetpack-cloud-development',
		'jetpack-cloud-stage',
		'jetpack-cloud-production',
	];
	const calypsoEnv = config( 'env_id' );
	if ( jetpackCloudEnvs.includes( calypsoEnv ) ) {
		return;
	}

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
		const user = userFactory();
		const { primarySiteSlug } = user.get();
		let redirectPath =
			primarySiteSlug && 'variant' === abtest( 'redirectToCustomerHome' )
				? `/home/${ primarySiteSlug }`
				: '/read';

		if ( context.querystring ) {
			redirectPath += `?${ context.querystring }`;
		}

		page.redirect( redirectPath );
	} );
}
