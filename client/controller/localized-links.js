import config from '@automattic/calypso-config';
import { localizeUrl, getLanguageSlugs } from '@automattic/i18n-utils';
import performanceMark from 'calypso/server/lib/performance-mark';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { setDocumentHeadLink } from 'calypso/state/document-head/actions';

const getLocalizedCanonicalUrl = ( path, locale, excludeSearch = false ) => {
	const baseUrl = new URL( path, 'https://wordpress.com' );

	if ( excludeSearch ) {
		baseUrl.search = '';
	}

	const baseUrlWithoutLang = baseUrl.href.replace(
		new RegExp( `\\/(${ getLanguageSlugs().join( '|' ) })(\\/|\\?|$)` ),
		'$2'
	);
	let localizedUrl = localizeUrl( baseUrlWithoutLang, locale, false );

	// Remove the trailing slash if `path` doesn't have one either.
	if ( ! path.endsWith( '/' ) && localizedUrl.endsWith( '/' ) ) {
		localizedUrl = localizedUrl.slice( 0, -1 );
	}

	return localizedUrl;
};

export const excludeSearchFromCanonicalUrlAndHrefLangLinks = ( context, next ) => {
	context.excludeSearchFromCanonicalUrl = true;
	next();
};

export const setLocalizedCanonicalUrl = ( context, next ) => {
	performanceMark( context, 'setLocalizedCanonicalUrl' );

	if ( ! context.isServerSide || isUserLoggedIn( context.store.getState() ) ) {
		next();
		return;
	}

	const canonicalUrl = getLocalizedCanonicalUrl(
		context.originalUrl,
		context.i18n.getLocaleSlug(),
		context.excludeSearchFromCanonicalUrl
	);

	context.store.dispatch(
		setDocumentHeadLink( {
			rel: 'canonical',
			href: canonicalUrl,
		} )
	);

	next();
};

export const setHrefLangLinks = ( context, next ) => {
	if ( ! context.isServerSide || isUserLoggedIn( context.store.getState() ) ) {
		next();
		return;
	}
	performanceMark( context, 'setHrefLangLinks' );

	const langCodes = [ 'x-default', 'en', ...config( 'magnificent_non_en_locales' ) ];
	const hrefLangBlock = langCodes.map( ( hrefLang ) => {
		let localeSlug = hrefLang;

		if ( localeSlug === 'x-default' ) {
			localeSlug = config( 'i18n_default_locale_slug' );
		}

		const href = getLocalizedCanonicalUrl(
			context.originalUrl,
			localeSlug,
			context.excludeSearchFromCanonicalUrl
		);

		return {
			rel: 'alternate',
			hrefLang,
			href,
		};
	} );

	context.store.dispatch( setDocumentHeadLink( hrefLangBlock ) );
	next();
};
