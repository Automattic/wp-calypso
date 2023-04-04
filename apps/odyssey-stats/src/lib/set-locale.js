import debugFactory from 'debug';
import i18n from 'i18n-calypso';
import moment from 'moment';

const debug = debugFactory( 'apps:odyssey' );

const DEFAULT_LOCALE = 'en';

const loadMomentLocale = async ( localeSlug ) => {
	return import(
		/* webpackChunkName: "moment-locale-[request]", webpackInclude: /\.js$/ */ `moment/locale/${ localeSlug }`
	).then( () => moment.locale( localeSlug ) );
};

const loadLanguageFile = ( localeSlug ) => {
	const url = `https://widgets.wp.com/odyssey-stats/v1/languages/${ localeSlug }-v1.1.json`;

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

export default async ( localeSlug ) => {
	if ( localeSlug === DEFAULT_LOCALE ) {
		return;
	}

	return Promise.all( loadLanguageFile( localeSlug ), loadMomentLocale( localeSlug ) )
		.then( () => debug( `Loaded locale file for ${ localeSlug } successfully.` ) )
		.catch( ( error ) =>
			debug(
				`Encountered an error loading locale file for ${ localeSlug }. Falling back to English.`,
				error
			)
		);
};
