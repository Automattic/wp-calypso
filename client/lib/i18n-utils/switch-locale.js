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

const debug = debugFactory( 'calypso:i18n' );

function languageFileUrl( localeSlug ) {
	var protocol = typeof window === 'undefined' ? 'https://' : '//'; // use a protocol-relative path in the browser
	return `${ protocol }widgets.wp.com/languages/calypso/${ localeSlug }.json`;
}

export default function switchLocale( localeSlug ) {
	if ( localeSlug === config( 'i18n_default_locale_slug' ) ) {
		i18n.configure( { defaultLocaleSlug: localeSlug } );
		return;
	}

	request.get( languageFileUrl( localeSlug ) ).end( function( error, response ) {
		if ( error ) {
			debug( 'Encountered an error loading locale file for ' + localeSlug + '. Falling back to English.' );
			return;
		}
		i18n.setLocale( response.body );
	} );
}
