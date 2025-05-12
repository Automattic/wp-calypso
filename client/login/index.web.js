import config from '@automattic/calypso-config';
import { getLanguageRouteParam } from '@automattic/i18n-utils';
import { Provider as ReduxProvider } from 'react-redux';
import CalypsoI18nProvider from 'calypso/components/calypso-i18n-provider';
import { RouteProvider } from 'calypso/components/route';
import { setHrefLangLinks } from 'calypso/controller/localized-links';
import {
	setLocaleMiddleware,
	setSectionMiddleware,
	makeLayoutMiddleware,
} from 'calypso/controller/shared';
import LayoutLoggedOut from 'calypso/layout/logged-out';
import {
	login,
	magicLogin,
	qrCodeLogin,
	magicLoginUse,
	redirectJetpack,
	redirectDefaultLocale,
	redirectLostPassword,
	desktopLogin,
	desktopLoginFinalize,
} from './controller';
import redirectLoggedIn from './redirect-logged-in';
import { setShouldServerSideRenderLogin, ssrSetupLocaleLogin, setMetaTags } from './ssr';

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
	showGdprBanner,
	i18n,
} ) => {
	return (
		<CalypsoI18nProvider i18n={ i18n }>
			<RouteProvider
				currentSection={ currentSection }
				currentRoute={ currentRoute }
				currentQuery={ currentQuery }
			>
				<ReduxProvider store={ store }>
					<LayoutLoggedOut
						primary={ primary }
						secondary={ secondary }
						redirectUri={ redirectUri }
						showGdprBanner={ showGdprBanner }
					/>
				</ReduxProvider>
			</RouteProvider>
		</CalypsoI18nProvider>
	);
};

const makeLoggedOutLayout = makeLayoutMiddleware( ReduxWrappedLayout );

export default ( router ) => {
	const lang = getLanguageRouteParam();

	// The /log-in/desktop routes are only used by the WordPress.com Desktop app.
	router(
		[ `/log-in/desktop/${ lang }` ],
		redirectLoggedIn,
		setLocaleMiddleware(),
		setMetaTags,
		setSectionMiddleware( { ...LOGIN_SECTION_DEFINITION, isomorphic: false } ),
		desktopLogin,
		makeLoggedOutLayout
	);
	router(
		[ `/log-in/desktop/finalize` ],
		redirectLoggedIn,
		setLocaleMiddleware(),
		setMetaTags,
		setSectionMiddleware( { ...LOGIN_SECTION_DEFINITION, isomorphic: false } ),
		desktopLoginFinalize,
		makeLoggedOutLayout
	);

	if ( config.isEnabled( 'login/magic-login' ) ) {
		router(
			[ `/log-in/link/use/${ lang }`, `/log-in/jetpack/link/use/${ lang }` ],
			redirectLoggedIn,
			setLocaleMiddleware(),
			setMetaTags,
			setSectionMiddleware( LOGIN_SECTION_DEFINITION ),
			magicLoginUse,
			makeLoggedOutLayout
		);

		router(
			[ `/log-in/link/${ lang }`, `/log-in/jetpack/link/${ lang }`, `/log-in/new/link/${ lang }` ],
			setLocaleMiddleware(),
			setMetaTags,
			setSectionMiddleware( LOGIN_SECTION_DEFINITION ),
			magicLogin,
			makeLoggedOutLayout
		);
	}

	router(
		[ `/log-in/qr/${ lang }`, `/log-in/jetpack/qr/${ lang }` ],
		redirectLoggedIn,
		setLocaleMiddleware(),
		setMetaTags,
		setSectionMiddleware( LOGIN_SECTION_DEFINITION ),
		qrCodeLogin,
		makeLoggedOutLayout
	);

	router(
		[
			`/log-in/:twoFactorAuthType(authenticator|backup|sms|push|webauthn)/${ lang }`,
			`/log-in/:flow(social-connect)/${ lang }`,
			`/log-in/:socialService(google|apple|github)/callback/${ lang }`,
			`/log-in/:isJetpack(jetpack)/${ lang }`,
			`/log-in/:isJetpack(jetpack)/:twoFactorAuthType(authenticator|backup|sms|push|webauthn)/${ lang }`,
			`/log-in/:isJetpack(jetpack)/:action(lostpassword)/${ lang }`,
			`/log-in/:isGutenboarding(new)/${ lang }`,
			`/log-in/:isGutenboarding(new)/:twoFactorAuthType(authenticator|backup|sms|push|webauthn)/${ lang }`,
			`/log-in/:action(lostpassword)/${ lang }`,
			`/log-in/${ lang }`,
		],
		redirectJetpack,
		redirectDefaultLocale,
		setLocaleMiddleware(),
		setHrefLangLinks,
		setMetaTags,
		setSectionMiddleware( LOGIN_SECTION_DEFINITION ),
		login,
		setShouldServerSideRenderLogin,
		ssrSetupLocaleLogin,
		makeLoggedOutLayout,
		redirectLostPassword
	);
};
