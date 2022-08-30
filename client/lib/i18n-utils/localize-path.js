import { isMagnificentLocale, urlLocalizationMapping } from '@automattic/i18n-utils';
import i18n from 'i18n-calypso';

const DEFAULT_ORIGIN = 'https://wordpress.com';

function getDefaultLocale() {
	return i18n.getLocaleSlug?.() ?? 'en';
}

function suffixLocalizedPath( path, locale ) {
	if ( ! isMagnificentLocale( locale ) ) {
		return path;
	}
	return `${ path }${ locale }/`;
}

function normalizePath( urlLocalizationMappingFn ) {
	return ( path, locale, isLoggedIn ) => {
		const url = new URL( path, DEFAULT_ORIGIN );
		const output = urlLocalizationMappingFn( url, locale, isLoggedIn );
		return output.href.replace( DEFAULT_ORIGIN, '' );
	};
}

const pathLocalizationMapping = {
	'/theme/': normalizePath( urlLocalizationMapping[ 'wordpress.com/theme/' ] ),
	'/themes/': normalizePath( urlLocalizationMapping[ 'wordpress.com/themes/' ] ),
	'/log-in/': normalizePath( urlLocalizationMapping[ 'wordpress.com/log-in/' ] ),
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
