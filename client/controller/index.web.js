import config from '@automattic/calypso-config';
import {
	getLanguage,
	getLanguageSlugs,
	removeLocaleFromPathLocaleInFront,
} from '@automattic/i18n-utils';
import { QueryClientProvider } from '@tanstack/react-query';
import { translate } from 'i18n-calypso';
import page from 'page';
import { Provider as ReduxProvider } from 'react-redux';
import CalypsoI18nProvider from 'calypso/components/calypso-i18n-provider';
import EmptyContent from 'calypso/components/empty-content';
import MomentProvider from 'calypso/components/localized-moment/provider';
import { RouteProvider } from 'calypso/components/route';
import Layout from 'calypso/layout';
import LayoutLoggedOut from 'calypso/layout/logged-out';
import { login, createAccountUrl } from 'calypso/lib/paths';
import { CalypsoReactQueryDevtools } from 'calypso/lib/react-query-devtools-helper';
import { getSiteFragment } from 'calypso/lib/route';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import {
	getImmediateLoginEmail,
	getImmediateLoginLocale,
} from 'calypso/state/immediate-login/selectors';
import { makeLayoutMiddleware } from './shared.js';
import { render, hydrate } from './web-util.js';

/**
 * Re-export
 */
export { setSectionMiddleware, setLocaleMiddleware } from './shared.js';
export { render, hydrate } from './web-util.js';

export const ProviderWrappedLayout = ( {
	store,
	queryClient,
	currentSection,
	currentRoute,
	currentQuery,
	primary,
	secondary,
	renderHeaderSection,
	redirectUri,
} ) => {
	const state = store.getState();
	const userLoggedIn = isUserLoggedIn( state );
	const layout = userLoggedIn ? (
		<Layout primary={ primary } secondary={ secondary } />
	) : (
		<LayoutLoggedOut
			primary={ primary }
			secondary={ secondary }
			redirectUri={ redirectUri }
			renderHeaderSection={ renderHeaderSection }
		/>
	);

	return (
		<CalypsoI18nProvider>
			<RouteProvider
				currentSection={ currentSection }
				currentRoute={ currentRoute }
				currentQuery={ currentQuery }
			>
				<QueryClientProvider client={ queryClient }>
					<ReduxProvider store={ store }>
						<MomentProvider>{ layout }</MomentProvider>
					</ReduxProvider>
					<CalypsoReactQueryDevtools />
				</QueryClientProvider>
			</RouteProvider>
		</CalypsoI18nProvider>
	);
};

export const makeLayout = makeLayoutMiddleware( ProviderWrappedLayout );

/**
 * For logged in users with bootstrap (production), ReactDOM.hydrate().
 * Otherwise (development), ReactDOM.render().
 * See: https://wp.me/pd2qbF-P#comment-20
 * @param context - Middleware context
 */
function smartHydrate( context ) {
	const doHydrate =
		! config.isEnabled( 'wpcom-user-bootstrap' ) && isUserLoggedIn( context.store.getState() )
			? render
			: hydrate;

	doHydrate( context );
}

/**
 * Isomorphic routing helper, client side
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
	page( route, ...middlewares, smartHydrate );
}

export const redirectInvalidLanguage = ( context, next ) => {
	const langParam = context.params.lang;
	const language = getLanguage( langParam );
	if ( langParam && ! language ) {
		// redirect unsupported language to the default language
		return page.redirect( context.path.replace( `/${ langParam }`, '' ) );
	} else if ( langParam && language.langSlug !== langParam ) {
		// redirect unsupported child language to the parent language
		return page.redirect( context.path.replace( `/${ langParam }`, `/${ language.langSlug }` ) );
	}
	next();
};

export function redirectLoggedOut( context, next ) {
	const state = context.store.getState();
	if ( isUserLoggedIn( state ) ) {
		next();
		return;
	}

	const { site, blog, blog_id } = context.params;
	const siteFragment = site || blog || blog_id || getSiteFragment( context.path );

	const loginParameters = {
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

	if (
		'1' === context.query?.unlinked &&
		loginParameters.redirectTo &&
		loginParameters.redirectTo.startsWith( '/checkout/' )
	) {
		loginParameters.isJetpack = true;
		loginParameters.redirectTo = 'https://wordpress.com' + loginParameters.redirectTo;
	}

	// force full page reload to avoid SSR hydration issues.
	window.location = login( loginParameters );
	return;
}

/**
 * Middleware to redirect logged out users to create an account.
 * Designed for use in situations where no site is selected, such as the reader.
 * @param   {Object}   context Context object
 * @param   {Function} next    Calls next middleware
 * @returns {void}
 */
export function redirectLoggedOutToSignup( context, next ) {
	const state = context.store.getState();
	if ( isUserLoggedIn( state ) ) {
		next();
		return;
	}

	return page.redirect( createAccountUrl( { redirectTo: context.path, ref: 'reader-lp' } ) );
}

/**
 * Removes the locale param from the path and redirects logged-in users to it.
 * @param   {Object}   context Context object
 * @param   {Function} next    Calls next middleware
 * @returns {void}
 */
export function redirectWithoutLocaleParamIfLoggedIn( context, next ) {
	if ( isUserLoggedIn( context.store.getState() ) && context.params.lang ) {
		const langSlugs = getLanguageSlugs();
		const langSlugPathSegmentMatcher = new RegExp( `\\/(${ langSlugs.join( '|' ) })(\\/|\\?|$)` );
		const pathWithoutLocale = context.path.replace( langSlugPathSegmentMatcher, '$2' );

		return page.redirect( pathWithoutLocale );
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

export const redirectLoggedInUrl = ( context, next ) => {
	if ( isUserLoggedIn( context.store.getState() ) ) {
		const pathWithoutLocale = removeLocaleFromPathLocaleInFront( context.path );
		if ( pathWithoutLocale !== context.path ) {
			return page.redirect( pathWithoutLocale );
		}
	}
	next();
};
