/** @format */

/**
 * Internal dependencies
 */
import config from 'config';
import controller from './controller';
import { makeLayout, redirectLoggedIn, setUpLocale } from 'controller';

const { lang, login, magicLogin, magicLoginUse, redirectDefaultLocale } = controller;

export default router => {
	if ( config.isEnabled( 'login/magic-login' ) ) {
		router(
			`/log-in/link/use/${ lang }`,
			setUpLocale,
			redirectLoggedIn,
			magicLoginUse,
			makeLayout
		);

		router( `/log-in/link/${ lang }`, setUpLocale, redirectLoggedIn, magicLogin, makeLayout );
	}

	if ( config.isEnabled( 'login/wp-login' ) ) {
		router(
			[
				`/log-in/:twoFactorAuthType(authenticator|backup|sms|push)/${ lang }`,
				`/log-in/:flow(social-connect|private-site)/${ lang }`,
				`/log-in/:socialService(google)/callback/${ lang }`,
				`/log-in/${ lang }`,
			],
			redirectDefaultLocale,
			setUpLocale,
			login,
			makeLayout
		);
	}
};
