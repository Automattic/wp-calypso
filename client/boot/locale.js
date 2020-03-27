/**
 * External dependencies
 */
import { get } from 'lodash';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import config from 'config';
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

	const getTranslationChunkPath = ( chunkId, langSlug = currentUser.localeSlug ) => {
		return `/calypso/evergreen/languages/${ langSlug }/${ chunkId }.json`;
	};

	const loadedTranslationChunks = {};
	const fetchTranslationChunk = translationChunkPath => {
		return window
			.fetch( translationChunkPath )
			.then( response => response.json() )
			.then( data => {
				i18n.addTranslations( data );
				loadedTranslationChunks[ translationChunkPath ] = true;
				return;
			} )
			.catch( error => error );
	};

	if ( config.isEnabled( 'use-translation-chunks' ) && '__requireChunkCallback__' in window ) {
		let translatedChunks; // should we get these bootstrapped on page load, similarly to `languageRevisions`?

		window
			.fetch( `/calypso/evergreen/languages/${ currentUser.localeSlug }/language-manifest.json` )
			.then( response => response.json() )
			.then( data => {
				translatedChunks = data.translatedChunks;
				i18n.setLocale( data.locale );
				const installedChunks = ( window.installedChunks || [] ).concat(
					window.__requireChunkCallback__.getInstalledChunks()
				);

				installedChunks.forEach( chunkId => {
					const translationChunkPath = getTranslationChunkPath( chunkId );

					if (
						translatedChunks.includes( chunkId ) &&
						! loadedTranslationChunks[ translationChunkPath ]
					) {
						fetchTranslationChunk( translationChunkPath );
					}
				} );
			} );

		window.__requireChunkCallback__.add( ( { publicPath, scriptSrc }, promises ) => {
			const chunkId = scriptSrc.replace( publicPath, '' ).replace( /\.js$/, '' );
			const translationChunkPath = getTranslationChunkPath( chunkId );

			if ( ! translatedChunks ) {
				return;
			}

			if (
				translatedChunks.includes( chunkId ) &&
				! loadedTranslationChunks[ translationChunkPath ]
			) {
				promises.push( fetchTranslationChunk( translationChunkPath ) );
			}
		} );
	}

	// If user is logged out and translations are not boostrapped, we assume default locale
};
