import debugFactory from 'debug';
import i18n from 'i18n-calypso';
import moment from 'moment';

const debug = debugFactory( 'apps:odyssey' );

const DEFAULT_LANGUAGE = 'en';
const DEFAULT_MOMENT_LOCALE = 'en';
const ALWAYS_LOAD_WITH_LOCALE = [ 'zh' ];

const getLanguageCodeFromLocale = ( localeSlug: string ) => {
	if ( localeSlug.indexOf( '-' ) > -1 ) {
		return localeSlug.split( '-' )[ 0 ];
	}
	return localeSlug;
};

const loadMomentLocale = ( localeSlug: string, languageCode: string ) => {
	return import( `moment/locale/${ localeSlug }` )
		.catch( ( error: Error ) => {
			debug(
				`Encountered an error loading moment locale file for ${ localeSlug }. Falling back to language datetime format.`,
				error
			);
			// Fallback 1 to the language code.
			if ( localeSlug !== languageCode ) {
				localeSlug = languageCode;
				return import( `moment/locale/${ localeSlug }` );
			}
			// Pass it to the next catch block if the language code is the same as the locale slug.
			return Promise.reject( error );
		} )
		.catch( ( error: Error ) => {
			debug(
				`Encountered an error loading moment locale file for ${ localeSlug }. Falling back to US datetime format.`,
				error
			);
			// Fallback 2 to the default US date time format.
			// Interestingly `en` here represents `en-us` locale.
			localeSlug = DEFAULT_MOMENT_LOCALE;
		} )
		.then( () => moment.locale( localeSlug ) );
};

const loadLanguageFile = ( languageFileName: string ) => {
	const url = `https://widgets.wp.com/odyssey-stats/v1/languages/${ languageFileName }-v1.1.json`;

	return globalThis.fetch( url ).then( ( response ) => {
		if ( response.ok ) {
			return response.json().then( ( body ) => {
				if ( body ) {
					i18n.setLocale( body );
				}
			} );
		}
		return Promise.reject( response );
	} );
};

export default ( localeSlug: string ) => {
	const languageCode = getLanguageCodeFromLocale( localeSlug );

	// Load tranlation file if it's not English.
	if ( languageCode !== DEFAULT_LANGUAGE ) {
		const languageFileName = ALWAYS_LOAD_WITH_LOCALE.includes( languageCode )
			? localeSlug
			: languageCode;
		// We don't have to wait for the language file to load before rendering the page, because i18n is using hooks to update translations.
		loadLanguageFile( languageFileName )
			.then( () => debug( `Loaded locale files for ${ languageCode } successfully.` ) )
			.catch( ( error ) =>
				debug(
					`Encountered an error loading locale file for ${ languageCode }. Falling back to English.`,
					error
				)
			);
	}

	// We have to wait for moment locale to load before rendering the page, because otherwise the rendered date time wouldn't get re-rendered.
	// This could be improved in the future with hooks.
	return loadMomentLocale( localeSlug, languageCode );
};
