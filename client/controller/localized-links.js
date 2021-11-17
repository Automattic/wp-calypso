import config from '@automattic/calypso-config';
import { localizeUrl } from '@automattic/i18n-utils';
import { getLanguageSlugs } from '@automattic/languages';
import { getLocaleSlug } from 'i18n-calypso';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { setDocumentHeadLink } from 'calypso/state/document-head/actions';

const getLocalizedCanonicalUrl = ( path, locale ) => {
	const baseUrl = `https://wordpress.com${ path }`;
	const baseUrlWithoutLang = baseUrl.replace(
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

export const setLocalizedCanonicalUrl = ( context, next ) => {
	if ( ! context.isServerSide || isUserLoggedIn( context.store.getState() ) ) {
		next();
		return;
	}

	const href = getLocalizedCanonicalUrl( context.originalUrl, getLocaleSlug() );
	const link = {
		rel: 'canonical',
		href,
	};

	context.store.dispatch( setDocumentHeadLink( link ) );
	next();
};

export const setHrefLangLinks = ( context, next ) => {
	if ( ! context.isServerSide || isUserLoggedIn( context.store.getState() ) ) {
		next();
		return;
	}

	const langCodes = [ 'x-default', 'en', ...config( 'magnificent_non_en_locales' ) ];
	const hrefLangBlock = langCodes.map( ( hrefLang ) => {
		let localeSlug = hrefLang;

		if ( localeSlug === 'x-default' ) {
			localeSlug = config( 'i18n_default_locale_slug' );
		}

		const href = getLocalizedCanonicalUrl( context.originalUrl, localeSlug );
		return {
			rel: 'alternate',
			hrefLang,
			href,
		};
	} );

	context.store.dispatch( setDocumentHeadLink( hrefLangBlock ) );
	next();
};
