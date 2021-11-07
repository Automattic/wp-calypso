import config from '@automattic/calypso-config';
import { localizeUrl } from '@automattic/i18n-utils';
import { getLocaleSlug } from 'i18n-calypso';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider as ReduxProvider } from 'react-redux';
import CalypsoI18nProvider from 'calypso/components/calypso-i18n-provider';
import { RouteProvider } from 'calypso/components/route';
import LayoutLoggedOut from 'calypso/layout/logged-out';
import { getLanguageSlugs } from 'calypso/lib/i18n-utils';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { setDocumentHeadLink } from 'calypso/state/document-head/actions';
import { makeLayoutMiddleware } from './shared.js';
import { ssrSetupLocaleMiddleware } from './ssr-setup-locale.js';

/**
 * Re-export
 */
export { setSectionMiddleware, setLocaleMiddleware } from './shared.js';

/**
 * Server side rendering (SSR) is used exclusively for logged out users. Normally, for
 * logged out users, we wouldn't need the react-query QueryClientProvider. This is
 * because only logged-in users have access to REST endpoints, hence no fetches made by
 * react-query, and no need for the QueryClientProvider.
 *
 * We, however add it here in order to prevent errors when server side rendering (SSR).
 * For context, there are components shared between logged-in and logged-out views.
 * If ProviderWrappedLoggedOutLayout initializes content that contains a useQuery call
 * in one of these shared components (even if it's not enabled), SSR will throw an error
 * regarding an inaccessible QueryClient.
 *
 * Ideally, useQuery would only be called for logged-in routes on a site, but ensuring
 * that will require more planning and deliberate refactoring.
 *
 * https://github.com/Automattic/wp-calypso/pull/56916#issuecomment-942730743
 */
const ProviderWrappedLoggedOutLayout = ( {
	store,
	queryClient = new QueryClient(),
	currentSection,
	currentRoute,
	currentQuery,
	primary,
	secondary,
	redirectUri,
} ) => (
	<CalypsoI18nProvider>
		<RouteProvider
			currentSection={ currentSection }
			currentRoute={ currentRoute }
			currentQuery={ currentQuery }
		>
			<QueryClientProvider client={ queryClient }>
				<ReduxProvider store={ store }>
					<LayoutLoggedOut
						primary={ primary }
						secondary={ secondary }
						redirectUri={ redirectUri }
					/>
				</ReduxProvider>
			</QueryClientProvider>
		</RouteProvider>
	</CalypsoI18nProvider>
);

/**
 * @param { object } context -- Middleware context
 * @param {Function} next -- Call next middleware in chain
 *
 * Produce a `LayoutLoggedOut` element in `context.layout`, using
 * `context.primary` and `context.secondary` to populate it.
 */
export const makeLayout = makeLayoutMiddleware( ProviderWrappedLoggedOutLayout );

export const ssrSetupLocale = ssrSetupLocaleMiddleware();

const getLocalizedCanonicalUrl = ( path, locale ) => {
	const baseUrl = `https://wordpress.com${ path }`;
	const baseUrlWithoutLang = baseUrl.replace(
		new RegExp( `\\/(${ getLanguageSlugs().join( '|' ) })(\\/|\\?|$)` ),
		'$2'
	);
	let localizedUrl = localizeUrl( baseUrlWithoutLang, locale, false );

	// Remove the trailing slash if `path` doesn't have one either.
	if ( path.slice( -1 ) !== '/' && localizedUrl.slice( -1 ) === '/' ) {
		localizedUrl = localizedUrl.slice( 0, -1 );
	}

	return localizedUrl;
};

export const setHrefLangLinks = ( context, next ) => {
	if ( isUserLoggedIn( context.store.getState() ) ) {
		next();
		return;
	}

	const langCodes = [ 'x-default', 'en', ...config( 'magnificent_non_en_locales' ) ];
	const hrefLangBlock = langCodes.map( ( hrefLang ) => {
		let localeSlug = hrefLang;

		if ( localeSlug === 'x-default' ) {
			localeSlug = config( 'i18n_default_locale_slug' );
		}

		const href = getLocalizedCanonicalUrl( context.res.req.originalUrl, localeSlug );
		return {
			rel: 'alternate',
			hrefLang,
			href,
		};
	} );

	context.store.dispatch( setDocumentHeadLink( hrefLangBlock ) );
	next();
};

export const setLocalizedCanonicalUrl = ( context, next ) => {
	if ( isUserLoggedIn( context.store.getState() ) ) {
		next();
		return;
	}

	const href = getLocalizedCanonicalUrl( context.res.req.originalUrl, getLocaleSlug() );
	const link = {
		rel: 'canonical',
		href,
	};

	context.store.dispatch( setDocumentHeadLink( link ) );
	next();
};

/**
 * These functions are not used by Node. It is here to provide an APi compatible with `./index.web.js`
 */
export const redirectLoggedOut = () => {};
export const redirectWithoutLocaleParamIfLoggedIn = () => {};
export const render = () => {};
export const ProviderWrappedLayout = () => null;
export const notFound = () => null;
