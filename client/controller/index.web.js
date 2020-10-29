/**
 * External dependencies
 */
import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import page from 'page';

/**
 * Internal Dependencies
 */
import config from 'config';
import { translate } from 'i18n-calypso';
import Layout from 'layout';
import LayoutLoggedOut from 'layout/logged-out';
import EmptyContent from 'components/empty-content';
import CalypsoI18nProvider from 'components/calypso-i18n-provider';
import MomentProvider from 'components/localized-moment/provider';
import { RouteProvider } from 'components/route';
import { login } from 'lib/paths';
import { makeLayoutMiddleware } from './shared.js';
import { isUserLoggedIn } from 'state/current-user/selectors';
import { getImmediateLoginEmail, getImmediateLoginLocale } from 'state/immediate-login/selectors';
import { getSiteFragment } from 'lib/route';
import { hydrate } from './web-util.js';

/**
 * Re-export
 */
export { setSectionMiddleware, setLocaleMiddleware } from './shared.js';
export { render, hydrate } from './web-util.js';

export const ProviderWrappedLayout = ( {
	store,
	currentSection,
	currentRoute,
	currentQuery,
	primary,
	secondary,
	redirectUri,
} ) => {
	const state = store.getState();
	const userLoggedIn = isUserLoggedIn( state );

	const layout = userLoggedIn ? (
		<Layout primary={ primary } secondary={ secondary } />
	) : (
		<LayoutLoggedOut primary={ primary } secondary={ secondary } redirectUri={ redirectUri } />
	);

	return (
		<CalypsoI18nProvider>
			<RouteProvider
				currentSection={ currentSection }
				currentRoute={ currentRoute }
				currentQuery={ currentQuery }
			>
				<ReduxProvider store={ store }>
					<MomentProvider>{ layout }</MomentProvider>
				</ReduxProvider>
			</RouteProvider>
		</CalypsoI18nProvider>
	);
};

export const makeLayout = makeLayoutMiddleware( ProviderWrappedLayout );

/**
 * Isomorphic routing helper, client side
 *
 * @param { string } route - A route path
 * @param {...Function} middlewares - Middleware to be invoked for route
 *
 * This function is passed to individual sections' controllers via
 * `server/bundler/loader`. Sections are free to either ignore it, or use it
 * instead of directly calling `page` for linking routes and middlewares in
 * order to be also usable for server-side rendering (and isomorphic routing).
 * `clientRouter` then also renders the element tree contained in `context.layout`
 * (or, if that is empty, in `context.primary`) to the respectively corresponding
 * divs.
 */
export function clientRouter( route, ...middlewares ) {
	page( route, ...middlewares, hydrate );
}

export function redirectLoggedOut( context, next ) {
	const state = context.store.getState();
	const userLoggedOut = ! isUserLoggedIn( state );

	if ( userLoggedOut ) {
		const siteFragment = context.params.site || getSiteFragment( context.path );

		const loginParameters = {
			isNative: config.isEnabled( 'login/native-login-links' ),
			redirectTo: context.path,
			site: siteFragment,
		};

		// Pass along "login_email" and "login_locale" parameters from the
		// original URL, to ensure the login form is pre-filled with the
		// correct email address and built with the correct language (when
		// either of those are requested).
		const login_email = getImmediateLoginEmail( state );
		if ( login_email ) {
			loginParameters.emailAddress = login_email;
		}
		const login_locale = getImmediateLoginLocale( state );
		if ( login_locale ) {
			loginParameters.locale = login_locale;
		}

		// force full page reload to avoid SSR hydration issues.
		window.location = login( loginParameters );
		return;
	}
	next();
}

export const notFound = ( context, next ) => {
	/* eslint-disable wpcalypso/jsx-classname-namespace */
	context.primary = (
		<EmptyContent
			className="content-404"
			illustration="/calypso/images/illustrations/illustration-404.svg"
			title={ translate( 'Uh oh. Page not found.' ) }
			line={ translate( "Sorry, the page you were looking for doesn't exist or has been moved." ) }
		/>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */

	next();
};
