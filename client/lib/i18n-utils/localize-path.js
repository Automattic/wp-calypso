import { isMagnificentLocale } from '@automattic/i18n-utils';
import i18n from 'i18n-calypso';

const DEFAULT_ORIGIN = 'https://wordpress.com';

function getDefaultLocale() {
	return i18n.getLocaleSlug?.() ?? 'en';
}

function prefixLocalizedPath( path, locale ) {
	if ( ! isMagnificentLocale( locale ) ) {
		return path;
	}
	return `/${ locale }${ path }`;
}
function suffixLocalizedPath( path, locale ) {
	if ( ! isMagnificentLocale( locale ) ) {
		return path;
	}
	return `${ path }${ locale }/`;
}

const pathLocalizationMapping = {
	'/theme/': ( path, localeSlug, isLoggedIn ) => {
		return isLoggedIn ? path : prefixLocalizedPath( path, localeSlug );
	},
	'/themes/': ( path, localeSlug, isLoggedIn ) => {
		return isLoggedIn ? path : prefixLocalizedPath( path, localeSlug );
	},
	'/log-in/': ( path, localeSlug, isLoggedIn ) => {
		return isLoggedIn ? path : suffixLocalizedPath( path, localeSlug );
	},
	'/new/': ( path, localeSlug, isLoggedIn ) => {
		return isLoggedIn ? path : suffixLocalizedPath( path, localeSlug );
	},
	'/setup/': ( path, localeSlug, isLoggedIn ) => {
		return isLoggedIn ? path : suffixLocalizedPath( path, localeSlug );
	},
};

export function localizePath( path, locale = getDefaultLocale(), isLoggedIn = true ) {
	if ( typeof path !== 'string' ) {
		return path;
	}

	path = path.replace( DEFAULT_ORIGIN, '' );

	const lookup = path.split( '/' ).reduce(
		( acc, segment ) => {
			if ( ! segment ) {
				return acc;
			}
			const lastSegment = acc[ acc.length - 1 ];
			return [ ...acc, lastSegment + segment + '/' ];
		},
		[ '/' ]
	);

	if ( '/' + locale + '/' === lookup[ 1 ] ) {
		return path;
	}

	const fullPath = lookup[ lookup.length - 1 ];
	for ( let i = lookup.length - 1; i >= 0; i-- ) {
		if ( lookup[ i ] in pathLocalizationMapping ) {
			return pathLocalizationMapping[ lookup[ i ] ]( fullPath, locale, isLoggedIn );
		}
	}

	return path;
}
