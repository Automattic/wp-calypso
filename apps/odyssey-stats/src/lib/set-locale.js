import config from '@automattic/calypso-config';
import debugFactory from 'debug';
import i18n from 'i18n-calypso';
import { LOCALE_SET } from 'calypso/state/action-types';

const debug = debugFactory( 'apps:odyssey' );

const getLanguageFile = ( localeSlug ) => {
	const url = `https://widgets.wp.com/odyssey-stats/v1/languages/${ localeSlug }-v1.1.json`;

	return globalThis.fetch( url ).then( ( response ) => {
		if ( response.ok ) {
			return response.json();
		}
		return Promise.reject( response );
	} );
};

export default ( dispatch ) => {
	const defaultLocale = config( 'i18n_default_locale_slug' ) || 'en';
	const siteLocale = config( 'i18n_locale_slug' );
	const localeSlug = siteLocale || defaultLocale;

	if ( localeSlug === defaultLocale ) {
		return;
	}

	getLanguageFile( localeSlug ).then(
		// Success.
		( body ) => {
			if ( body ) {
				i18n.setLocale( body );
			}
			// MomentProvider depends on the state to load locale file.
			dispatch( {
				type: LOCALE_SET,
				localeSlug: localeSlug,
			} );
		},
		// Failure.
		() => {
			debug(
				`Encountered an error loading locale file for ${ localeSlug }. Falling back to English.`
			);
		}
	);
};
