import { defaultI18n, getLocaleData } from '@wordpress/i18n';
import i18n from 'i18n-calypso';

const DEFAULT_LANGUAGE = 'en';

const getLanguageCodeFromLocale = ( localeSlug: string ) => {
	const preserveFullLocale = [ 'zh-tw', 'zh-cn', 'pt-br', 'zh-hk', 'zh-sg' ];
	if ( localeSlug.indexOf( '-' ) > -1 && ! preserveFullLocale.includes( localeSlug ) ) {
		return localeSlug.split( '-' )[ 0 ];
	}
	return localeSlug;
};

const getUserLocale = function () {
	// Try getting the locale from wp.i18n
	const localeData = getLocaleData();
	if ( localeData && localeData[ '' ] && localeData[ '' ].localeSlug ) {
		return localeData[ '' ].localeSlug;
	}
	// Fallback to document locale
	const documentLocale = document.documentElement.lang ?? 'en';
	return getLanguageCodeFromLocale( documentLocale.toLowerCase() );
};

const loadLanguageFile = async ( languageFileName: string ) => {
	const url = `https://widgets.wp.com/command-palette/languages/${ languageFileName }-v1.1.json`;

	globalThis.fetch( url ).then( async ( response ) => {
		if ( response.ok ) {
			const body = await response.json();
			if ( body ) {
				// Work with the calypso i18n `translate` etc, this app and the command-palette package
				// aren't using this, but it might be used in the future.
				i18n.setLocale( body );
				// Work with the wordpress i18n `__` etc
				defaultI18n.setLocaleData( body, __i18n_text_domain__ );
				return;
			}
		}
		Promise.reject( response );
	} );
};

export default async () => {
	const languageCode = getUserLocale();

	// Load translation file if it's not English.
	if ( languageCode !== DEFAULT_LANGUAGE ) {
		// We don't have to wait for the language file to load before rendering the page, because i18n is using hooks to update translations.
		loadLanguageFile( languageCode );
	}
};
