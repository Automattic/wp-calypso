/**
 * External dependencies
 */
import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';

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
import { setShouldServerSideRenderLogin } from './ssr';
import { setUpLocale, setSection, makeLayoutMiddleware } from 'controller/shared';
import { redirectLoggedIn } from 'controller/web-util';
import LayoutLoggedOut from 'layout/logged-out';
import { getLanguageRouteParam } from 'lib/i18n-utils';
import GUTENBOARDING_BASE_NAME from 'landing/gutenboarding/basename.json';

export const LOGIN_SECTION_DEFINITION = {
	name: 'login',
	paths: [ '/log-in' ],
	module: 'login',
	enableLoggedOut: true,
	secondary: false,
	isomorphic: true,
};

const ReduxWrappedLayout = ( { store, primary, secondary, redirectUri } ) => {
	return (
		<ReduxProvider store={ store }>
			<LayoutLoggedOut primary={ primary } secondary={ secondary } redirectUri={ redirectUri } />
		</ReduxProvider>
	);
};

const makeLoggedOutLayout = makeLayoutMiddleware( ReduxWrappedLayout );

export default router => {
	const lang = getLanguageRouteParam();

	if ( config.isEnabled( 'login/magic-login' ) ) {
		router(
			`/log-in/link/use/${ lang }`,
			setUpLocale,
			setSection( LOGIN_SECTION_DEFINITION ),
			redirectLoggedIn,
			magicLoginUse,
			makeLoggedOutLayout
		);

		router(
			[
				`/log-in/link/${ lang }`,
				`/log-in/jetpack/link/${ lang }`,
				`/log-in/${ GUTENBOARDING_BASE_NAME }/link/${ lang }`,
			],
			setUpLocale,
			setSection( LOGIN_SECTION_DEFINITION ),
			redirectLoggedIn,
			magicLogin,
			makeLoggedOutLayout
		);
	}

	if ( config.isEnabled( 'login/wp-login' ) ) {
		router(
			[
				`/log-in/:twoFactorAuthType(authenticator|backup|sms|push|webauthn)/${ lang }`,
				`/log-in/:flow(social-connect|private-site)/${ lang }`,
				`/log-in/:socialService(google|apple)/callback/${ lang }`,
				`/log-in/:isJetpack(jetpack)/${ lang }`,
				`/log-in/:isJetpack(jetpack)/:twoFactorAuthType(authenticator|backup|sms|push|webauthn)/${ lang }`,
				`/log-in/:isGutenboarding(${ GUTENBOARDING_BASE_NAME })/${ lang }`,
				`/log-in/:isGutenboarding(${ GUTENBOARDING_BASE_NAME })/:twoFactorAuthType(authenticator|backup|sms|push|webauthn)/${ lang }`,
				`/log-in/${ lang }`,
			],
			redirectJetpack,
			redirectDefaultLocale,
			setUpLocale,
			setSection( LOGIN_SECTION_DEFINITION ),
			login,
			setShouldServerSideRenderLogin,
			makeLoggedOutLayout
		);
	}
};
