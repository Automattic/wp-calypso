import config from '@automattic/calypso-config';
import { isJetpackPlanSlug, isJetpackProductSlug } from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import {
	getLanguage,
	getLanguageSlugs,
	removeLocaleFromPathLocaleInFront,
} from '@automattic/i18n-utils';
import { QueryClientProvider } from '@tanstack/react-query';
import { removeQueryArgs } from '@wordpress/url';
import { translate } from 'i18n-calypso';
import { Provider as ReduxProvider } from 'react-redux';
import CalypsoI18nProvider from 'calypso/components/calypso-i18n-provider';
import EmptyContent from 'calypso/components/empty-content';
import MomentProvider from 'calypso/components/localized-moment/provider';
import { RouteProvider } from 'calypso/components/route';
import Layout from 'calypso/layout';
import LayoutLoggedOut from 'calypso/layout/logged-out';
import { navigate } from 'calypso/lib/navigate';
import { createAccountUrl, login } from 'calypso/lib/paths';
import { CalypsoReactQueryDevtools } from 'calypso/lib/react-query-devtools-helper';
import { addQueryArgs, getSiteFragment } from 'calypso/lib/route';
import {
	getProductSlugFromContext,
	isContextSourceMyJetpack,
} from 'calypso/my-sites/checkout/utils';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import {
	getImmediateLoginEmail,
	getImmediateLoginLocale,
} from 'calypso/state/immediate-login/selectors';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { getSiteAdminUrl, getSiteHomeUrl, getSiteOption } from 'calypso/state/sites/selectors';
import { setSelectedSiteId } from 'calypso/state/ui/actions/set-sites.js';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import { makeLayoutMiddleware } from './shared.js';
import { hydrate, render } from './web-util.js';

/**
 * Re-export
 */
export { setLocaleMiddleware, setSectionMiddleware } from './shared.js';
export { hydrate, render } from './web-util.js';

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
	// Allow logged-out users to access account deleted page for self-restore.
	// This is an exception because /me should not allow enableLoggedOut.
	if ( context.pathname === '/me/account/closed' ) {
		return next();
	}

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
 * Middleware to redirect users coming from My Jetpack when necessary
 * @see pbNhbs-ag3-p2
 * @param   {Object}   context Context object
 * @param   {Function} next    Calls next middleware
 * @returns {void}
 */
export function redirectMyJetpack( context, next ) {
	const state = context.store.getState();
	const productSlug = getProductSlugFromContext( context );
	// Strip the slug's quantity suffix, for upgradable quantity based products.
	const product = productSlug.replace( /:-q-\d+/, '' );
	const isJetpackProduct = isJetpackPlanSlug( product ) || isJetpackProductSlug( product );

	if ( isJetpackProduct && ! isUserLoggedIn( state ) && isContextSourceMyJetpack( context ) ) {
		// Redirect to the siteless checkout page
		const redirectUrl = addQueryArgs(
			{
				connect_after_checkout: true,
				from_site_slug: context.query.site,
				admin_url: context.query.redirect_to.split( '?' )[ 0 ],
			},
			context.path.replace( /checkout\/[^?/]+\//, 'checkout/jetpack/' )
		);
		page( redirectUrl );
		return;
	}

	next();
}

/**
 * Middleware to redirect a user to the Dashboard.
 * @param   {Object}   context Context object
 * @returns {void}
 */
export function redirectToDashboard( context ) {
	const state = context.store.getState();
	const site = getSelectedSite( state );
	const adminInterface = getSiteOption( state, site?.ID, 'wpcom_admin_interface' );
	const redirectUrl =
		adminInterface === 'wp-admin'
			? getSiteAdminUrl( state, site?.ID )
			: getSiteHomeUrl( state, site?.ID );

	return navigate( redirectUrl );
}

/**
 * Middleware to redirect a user if they don't have the appropriate capability.
 * @param   {string}   capability Capability to check
 * @returns {Function}            Middleware function
 */
export function redirectIfCurrentUserCannot( capability ) {
	return ( context, next ) => {
		const state = context.store.getState();
		const site = getSelectedSite( state );
		const currentUserCan = canCurrentUser( state, site?.ID, capability );

		if ( site && ! currentUserCan ) {
			return redirectToDashboard( context );
		}

		next();
	};
}

/**
 * Middleware to redirect a user if the site is a P2.
 * @param   {Object}   context Context object
 * @param   {Function} next    Calls next middleware
 * @returns {void}
 */
export function redirectIfP2( context, next ) {
	const state = context.store.getState();
	const site = getSelectedSite( state );
	const isP2 = site?.options?.is_wpforteams_site;

	if ( isP2 ) {
		return redirectToDashboard( context );
	}

	next();
}

/**
 * Middleware to redirect a user if the site is a pure Jetpack site.
 * @param   {Object}   context Context object
 * @param   {Function} next    Calls next middleware
 * @returns {void}
 */
export function redirectIfJetpackNonAtomic( context, next ) {
	const state = context.store.getState();
	const site = getSelectedSite( state );
	const isAtomicSite = !! site?.is_wpcom_atomic || !! site?.is_wpcom_staging_site;
	const isJetpackNonAtomic = ! isAtomicSite && !! site?.jetpack;
	const isDisconnectedJetpackAndNotAtomic =
		! site?.is_wpcom_atomic && site?.jetpack_connection && ! site?.jetpack;

	if ( isJetpackNonAtomic || isDisconnectedJetpackAndNotAtomic ) {
		return redirectToDashboard( context );
	}

	next();
}

/**
 * Middleware to redirect a user to /hosting-features if the site is not Atomic.
 * @param   {Object}   context Context object
 * @param   {Function} next    Calls next middleware
 * @returns {void}
 */
export async function redirectToHostingPromoIfNotAtomic( context, next ) {
	const { getState } = context.store;
	const state = getState();
	const site = getSelectedSite( state );
	const isAtomicSite = !! site?.is_wpcom_atomic || !! site?.is_wpcom_staging_site;

	if ( ! isAtomicSite || site.plan?.expired ) {
		return page.redirect( '/sites/settings/site/' + context.params.site_id );
	}

	next();
}

/**
 * Removes the locale parameter from the path, and redirects logged-in users to it.
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

/**
 * Removes the locale parameter from the beginning of the path, and redirects logged-in users to it.
 * @param   {Object}   context Context object
 * @param   {Function} next    Calls next middleware
 * @returns {void}
 */
export const redirectWithoutLocaleParamInFrontIfLoggedIn = ( context, next ) => {
	if ( isUserLoggedIn( context.store.getState() ) ) {
		const pathWithoutLocale = removeLocaleFromPathLocaleInFront( context.path );

		if ( pathWithoutLocale !== context.path ) {
			return page.redirect( pathWithoutLocale );
		}
	}

	next();
};

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

/**
 * Middleware to set the selected site ID based on the `origin_site_id` query parameter.
 */
export const setSelectedSiteIdByOrigin = ( context, next ) => {
	const originSiteId = ( context.query.origin_site_id ?? '' ).trim();
	if ( originSiteId ) {
		context.store.dispatch( setSelectedSiteId( originSiteId ) );
		context.page.replace( removeQueryArgs( context.canonicalPath, 'origin_site_id' ) );
	}
	next();
};

/**
 * This function is only used to provide API compatibility for the sections that use shared controllers.
 */
export const ssrSetupLocale = ( _context, next ) => {
	next();
};

export const redirectIfDuplicatedView = ( wpAdminPath ) => async ( context, next ) => {
	const { getState } = context.store;
	const state = getState();
	const siteId = getSelectedSiteId( state );
	const wpAdminUrl = getSiteAdminUrl( state, siteId, wpAdminPath );

	if ( wpAdminUrl ) {
		window.location = wpAdminUrl;
		return;
	}
	next();
};
