/**
 * External dependencies
 */
import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';

/**
 * Internal dependencies
 */
import config from '@automattic/calypso-config';
import {
	login,
	magicLogin,
	magicLoginUse,
	redirectJetpack,
	redirectDefaultLocale,
} from './controller';
import { setShouldServerSideRenderLogin } from './ssr';
import {
	setLocaleMiddleware,
	setSectionMiddleware,
	makeLayoutMiddleware,
} from 'calypso/controller/shared';
import LayoutLoggedOut from 'calypso/layout/logged-out';
import { getLanguageRouteParam } from 'calypso/lib/i18n-utils';
import { RouteProvider } from 'calypso/components/route';
import redirectLoggedIn from './redirect-logged-in';

export const LOGIN_SECTION_DEFINITION = {
	name: 'login',
	paths: [ '/log-in' ],
	module: 'login',
	enableLoggedOut: true,
	isomorphic: true,
};

const ReduxWrappedLayout = ( {
	store,
	currentSection,
	currentRoute,
	currentQuery,
	primary,
	secondary,
	redirectUri,
} ) => {
	return (
		<RouteProvider
			currentSection={ currentSection }
			currentRoute={ currentRoute }
			currentQuery={ currentQuery }
		>
			<ReduxProvider store={ store }>
				<LayoutLoggedOut primary={ primary } secondary={ secondary } redirectUri={ redirectUri } />
			</ReduxProvider>
		</RouteProvider>
	);
};

const makeLoggedOutLayout = makeLayoutMiddleware( ReduxWrappedLayout );

export default ( router ) => {
	const lang = getLanguageRouteParam();

	if ( config.isEnabled( 'login/magic-login' ) ) {
		router(
			`/log-in/link/use/${ lang }`,
			redirectLoggedIn,
			setLocaleMiddleware,
			setSectionMiddleware( LOGIN_SECTION_DEFINITION ),
			magicLoginUse,
			makeLoggedOutLayout
		);

		router(
			[ `/log-in/link/${ lang }`, `/log-in/jetpack/link/${ lang }`, `/log-in/new/link/${ lang }` ],
			redirectLoggedIn,
			setLocaleMiddleware,
			setSectionMiddleware( LOGIN_SECTION_DEFINITION ),
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
				`/log-in/:isGutenboarding(new)/${ lang }`,
				`/log-in/:isGutenboarding(new)/:twoFactorAuthType(authenticator|backup|sms|push|webauthn)/${ lang }`,
				`/log-in/${ lang }`,
			],
			redirectJetpack,
			redirectDefaultLocale,
			setLocaleMiddleware,
			setSectionMiddleware( LOGIN_SECTION_DEFINITION ),
			login,
			setShouldServerSideRenderLogin,
			makeLoggedOutLayout
		);
	}
};
