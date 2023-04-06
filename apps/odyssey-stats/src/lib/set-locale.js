import debugFactory from 'debug';
import i18n from 'i18n-calypso';
import moment from 'moment';

const debug = debugFactory( 'apps:odyssey' );

const DEFAULT_LANGUAGE = 'en';

const getLanguageWithoutRegionCode = ( localeSlug ) => {
	if ( localeSlug.indexOf( '-' ) > -1 ) {
		return localeSlug.split( '-' )[ 0 ];
	}
	return localeSlug;
};

const loadMomentLocale = ( localeSlug, languageCode ) => {
	return import( `moment/locale/${ localeSlug }` )
		.catch( ( error ) => {
			debug(
				`Encountered an error loading moment locale file for ${ localeSlug }. Falling back to language datetime format.`,
				error
			);
			// Fallback to the language code.
			localeSlug = languageCode;
			return import( `moment/locale/${ localeSlug }` );
		} )
		.catch( ( error ) => {
			debug(
				`Encountered an error loading moment locale file for ${ localeSlug }. Falling back to US datetime format.`,
				error
			);
			// Fallback to US date time format.
			localeSlug = DEFAULT_LANGUAGE;
		} )
		.then( () => moment.locale( localeSlug ) );
};

const loadLanguageFile = ( localeSlug, languageCode ) => {
	const url = `https://widgets.wp.com/odyssey-stats/v1/languages/${ localeSlug }-v1.1.json`;

	return globalThis
		.fetch( url )
		.then( ( response ) => {
			if ( response.ok ) {
				return response.json().then( ( body ) => {
					if ( body ) {
						i18n.setLocale( body );
					}
				} );
			}
			return Promise.reject( response );
		} )
		.catch( ( response ) => {
			// Try to load the language file without the region code.
			if ( localeSlug !== languageCode ) {
				return loadLanguageFile( languageCode, languageCode );
			}
			// If we can't load the language file, throw the error.
			return Promise.reject( response );
		} );
};

export default ( localeSlug ) => {
	const languageCode = getLanguageWithoutRegionCode( localeSlug );
	// Load language file when the language is not English.
	// All English is default to American English exepct for `en-gb` which is the only other English locale we support.
	if ( languageCode !== DEFAULT_LANGUAGE || localeSlug === 'en-gb' ) {
		// We don't have to wait for the language file to load before rendering the page, because i18n is using hooks to update translations.
		loadLanguageFile( localeSlug, languageCode )
			.then( () => debug( `Loaded locale files for ${ localeSlug } successfully.` ) )
			.catch( ( error ) =>
				debug(
					`Encountered an error loading locale file for ${ localeSlug }. Falling back to English.`,
					error
				)
			);
	}

	// We have to wait for moment locale to load before rendering the page, because otherwise the rendered date time wouldn't get re-rendered.
	// This could be improved in the future with hooks.
	return loadMomentLocale( localeSlug, languageCode );
};
