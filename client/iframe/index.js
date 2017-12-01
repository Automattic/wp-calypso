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
