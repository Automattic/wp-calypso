import debugFactory from 'debug';
import i18n from 'i18n-calypso';
import moment from 'moment';

const debug = debugFactory( 'apps:odyssey' );

const DEFAULT_LOCALE = 'en';

const setMomentLocale = async ( localeSlug ) => {
	if ( localeSlug === DEFAULT_LOCALE ) {
		return;
	}

	debug( 'Loading moment locale for %s', localeSlug );
	try {
		// expose the import load promise as instance property. Useful for tests that wait for it
		import(
			/* webpackChunkName: "moment-locale-[request]", webpackInclude: /\.js$/ */ `moment/locale/${ localeSlug }`
		).then( () => moment.locale( localeSlug ) );
		debug( 'Loaded moment locale for %s', localeSlug );
	} catch ( error ) {
		debug( 'Failed to load moment locale for %s', localeSlug, error );
		return Promise.resolve( error );
	}
};

const getLanguageFile = ( localeSlug ) => {
	const url = `https://widgets.wp.com/odyssey-stats/v1/languages/${ localeSlug }-v1.1.json`;

	return globalThis.fetch( url ).then( ( response ) => {
		if ( response.ok ) {
			return response.json();
		}
		return Promise.reject( response );
	} );
};

export default async ( localeSlug ) => {
	if ( localeSlug === DEFAULT_LOCALE ) {
		return;
	}

	return getLanguageFile( localeSlug ).then(
		// Success.
		( body ) => {
			if ( body ) {
				i18n.setLocale( body );
			}
			return setMomentLocale( localeSlug );
		},
		// Failure.
		() => {
			debug(
				`Encountered an error loading locale file for ${ localeSlug }. Falling back to English.`
			);
		}
	);
};
