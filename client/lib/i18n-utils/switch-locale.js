/**
 * External dependencies
 */
import debugFactory from 'debug';
import i18n from 'i18n-calypso';
import request from 'superagent';

/**
 * Internal dependencies
 */
import { isDefaultLocale } from './utils';

const debug = debugFactory( 'calypso:i18n' );

function languageFileUrl( localeSlug ) {
	const protocol = typeof window === 'undefined' ? 'https://' : '//'; // use a protocol-relative path in the browser
	return `${ protocol }widgets.wp.com/languages/calypso/${ localeSlug }.json`;
}

export default function switchLocale( localeSlug ) {
	if ( localeSlug === i18n.getLocaleSlug() ) {
		return;
	}

	if ( isDefaultLocale( localeSlug ) ) {
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
