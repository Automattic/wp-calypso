/** @format */

/**
 * Internal dependencies
 */
import config from 'config';
import {
	login,
	magicLogin,
	magicLoginUse,
	redirectJetpack,
	redirectDefaultLocale,
} from './controller';
import { makeLayout, redirectLoggedIn, setUpLocale } from 'controller';
import { langRouteParams } from 'controller/shared';

export default router => {
	if ( config.isEnabled( 'login/magic-login' ) ) {
		router(
			`/log-in/link/use/${ langRouteParams }`,
			setUpLocale,
			redirectLoggedIn,
			magicLoginUse,
			makeLayout
		);

		router(
			`/log-in/link/${ langRouteParams }`,
			setUpLocale,
			redirectLoggedIn,
			magicLogin,
			makeLayout
		);
	}

	if ( config.isEnabled( 'login/wp-login' ) ) {
		router(
			[
				`/log-in/:twoFactorAuthType(authenticator|backup|sms|push)/${ langRouteParams }`,
				`/log-in/:flow(social-connect|private-site)/${ langRouteParams }`,
				`/log-in/:socialService(google)/callback/${ langRouteParams }`,
				`/log-in/:isJetpack(jetpack)/${ langRouteParams }`,
				`/log-in/${ langRouteParams }`,
			],
			redirectJetpack,
			redirectDefaultLocale,
			setUpLocale,
			login,
			makeLayout
		);
	}
};
