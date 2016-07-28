/**
 * External dependencies
 */
import request from 'superagent';
import i18n from 'i18n-calypso';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import config from 'config';
import i18nUtils from 'lib/i18n-utils';

const debug = debugFactory( 'calypso:i18n' );

export default function switchLocale( localeSlug ) {

	if ( localeSlug === i18n.getLocaleSlug() ) {
		return;
	}

	debug( 'Switching locale to ' + localeSlug );

	if ( localeSlug === config( 'i18n_default_locale_slug' ) ) {
		i18n.configure( { defaultLocaleSlug: localeSlug } );
		return;
	}

	request.get( i18nUtils.languageFileUrl( localeSlug ) ).end( function( error, response ) {
		if ( error ) {
			debug( 'Encountered an error loading locale file for ' + localeSlug + '. Falling back to English.' );
			return;
		}
		i18n.setLocale( response.body );
	} );
}
