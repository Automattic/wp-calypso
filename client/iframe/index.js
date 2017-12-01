/** @format */

/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import { login } from '../login/controller';
import { makeLayout, setUpLocale } from 'controller';

export default router => {
	router( '*', context => {
		// if we're changing section force a reload of the app
		if ( context.path.indexOf( '/iframe' ) !== 0 ) {
			window.location = context.canonicalPath;
		}
	} );

	router(
		[
			'/log-in/:twoFactorAuthType(authenticator|backup|sms|push)/:lang?',
			'/log-in/:flow(social-connect|private-site)/:lang?',
			'/log-in/:socialService(google)/callback/:lang?',
			'/log-in/:lang?',
		],
		setUpLocale,
		login,
		makeLayout
	);
};
