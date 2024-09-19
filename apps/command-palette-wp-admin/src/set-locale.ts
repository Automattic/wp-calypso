import { defaultI18n } from '@wordpress/i18n';
import i18n from 'i18n-calypso';

const DEFAULT_LANGUAGE = 'en';
const ALWAYS_LOAD_WITH_LOCALE = [ 'zh' ];

const getLanguageCodeFromLocale = ( localeSlug: string ) => {
	if ( localeSlug.indexOf( '-' ) > -1 ) {
		return localeSlug.split( '-' )[ 0 ];
	}
	return localeSlug;
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

export default async ( localeSlug: string ) => {
	const languageCode = getLanguageCodeFromLocale( localeSlug );

	// Load translation file if it's not English.
	if ( languageCode !== DEFAULT_LANGUAGE ) {
		const languageFileName = ALWAYS_LOAD_WITH_LOCALE.includes( languageCode )
			? localeSlug
			: languageCode;

		// We don't have to wait for the language file to load before rendering the page, because i18n is using hooks to update translations.
		loadLanguageFile( languageFileName );
	}
};
