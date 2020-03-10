/**
 * External dependencies
 */
import { get } from 'lodash';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { loadUserUndeployedTranslations } from 'lib/i18n-utils/switch-locale';
import { setLocale, setLocaleRawData } from 'state/ui/language/actions';

export const setupLocale = ( currentUser, reduxStore ) => {
	if ( window.i18nLocaleStrings ) {
		// Use the locale translation data that were boostrapped by the server
		const i18nLocaleStringsObject = JSON.parse( window.i18nLocaleStrings );
		reduxStore.dispatch( setLocaleRawData( i18nLocaleStringsObject ) );
		const languageSlug = get( i18nLocaleStringsObject, [ '', 'localeSlug' ] );
		if ( languageSlug ) {
			loadUserUndeployedTranslations( languageSlug );
		}
	} else if ( currentUser && currentUser.localeSlug ) {
		// Use the current user's and load traslation data with a fetch request
		reduxStore.dispatch( setLocale( currentUser.localeSlug, currentUser.localeVariant ) );
	}

	if ( '__requireChunkCallback__' in window ) {
		window.__requireChunkCallback__.add( ( chunkId, promises, publicPath ) => {
			const translationChunkName = `${ currentUser.localeSlug }-${ chunkId }`;
			const translationChunkPath = `${ publicPath }languages/${ translationChunkName }.json`; // @todo replace with actual translation path

			promises.push(
				window
					.fetch( translationChunkPath )
					.then( response => response.json() )
					.then( data => {
						i18n.addTranslations( data );
						return;
					} )
					.catch( error => error )
			);
		} );
	}

	// If user is logged out and translations are not boostrapped, we assume default locale
};
