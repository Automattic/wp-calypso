/**
 * External dependencies
 */
import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import config from '@automattic/calypso-config';
import { localizeUrl } from '@automattic/i18n-utils';

/**
 * Internal dependencies
 */
import { makeLayoutMiddleware } from './shared.js';
import { ssrSetupLocaleMiddleware } from './ssr-setup-locale.js';
import { getLanguageSlugs } from 'calypso/lib/i18n-utils';
import LayoutLoggedOut from 'calypso/layout/logged-out';
import CalypsoI18nProvider from 'calypso/components/calypso-i18n-provider';
import { RouteProvider } from 'calypso/components/route';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { setDocumentHeadLink } from 'calypso/state/document-head/actions';

/**
 * Re-export
 */
export { setSectionMiddleware, setLocaleMiddleware } from './shared.js';

const ProviderWrappedLoggedOutLayout = ( {
	store,
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
			<ReduxProvider store={ store }>
				<LayoutLoggedOut primary={ primary } secondary={ secondary } redirectUri={ redirectUri } />
			</ReduxProvider>
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

export const setHrefLangLinks = ( context, next ) => {
	const isLoggedIn = isUserLoggedIn( context.store.getState() );

	if ( isLoggedIn ) {
		next();
		return;
	}

	const langCodes = [ 'x-default', 'en', ...config( 'magnificent_non_en_locales' ) ];
	const hrefLangBlock = langCodes.map( ( hrefLang ) => {
		let localeSlug = hrefLang;

		if ( localeSlug === 'x-default' ) {
			localeSlug = config( 'i18n_default_locale_slug' );
		}

		const baseUrl = `${ context.res.req.protocol }://${ context.res.req.get( 'host' ) }${
			context.res.req.originalUrl
		}`;
		const baseUrlWithoutLang = baseUrl.replace(
			new RegExp( `\\/(${ getLanguageSlugs().join( '|' ) })(\\/|\\?|$)` ),
			'$2'
		);
		const href = localizeUrl( baseUrlWithoutLang, localeSlug, isLoggedIn );

		return {
			rel: 'alternate',
			hrefLang,
			href,
		};
	} );

	context.store.dispatch( setDocumentHeadLink( hrefLangBlock ) );
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
export const selectSiteIfLoggedIn = () => null;
