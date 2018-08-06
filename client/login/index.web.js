/** @format */

/**
 * Internal dependencies
 */
import config from 'config';
import {
	lang,
	login,
	magicLogin,
	magicLoginUse,
	redirectJetpack,
	redirectDefaultLocale,
	makeLoginLayout,
} from './controller';
import { setShouldServerSideRenderLogin } from './ssr';
import { redirectLoggedIn } from 'controller/lib/redirect-logged-in';
import { setUpLocale } from 'controller/shared';

export default router => {
	if ( config.isEnabled( 'login/magic-login' ) ) {
		router(
			`/log-in/link/use/${ lang }`,
			setUpLocale,
			redirectLoggedIn,
			magicLoginUse,
			makeLoginLayout
		);
		router( `/log-in/link/${ lang }`, setUpLocale, redirectLoggedIn, magicLogin, makeLoginLayout );
	}
	if ( config.isEnabled( 'login/wp-login' ) ) {
		router(
			[
				`/log-in/:twoFactorAuthType(authenticator|backup|sms|push)/${ lang }`,
				`/log-in/:flow(social-connect|private-site)/${ lang }`,
				`/log-in/:socialService(google)/callback/${ lang }`,
				`/log-in/:isJetpack(jetpack)/${ lang }`,
				`/log-in/${ lang }`,
			],
			redirectJetpack,
			redirectDefaultLocale,
			setUpLocale,
			login,
			setShouldServerSideRenderLogin,
			makeLoginLayout
		);
	}
};
