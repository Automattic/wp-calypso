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

	const fetchTranslationChunk = translationChunkPath => {
		return window
			.fetch( translationChunkPath )
			.then( response => response.json() )
			.then( data => {
				i18n.addTranslations( data );
				return;
			} )
			.catch( error => error );
	};

	const translationChunksQueue = [];
	let translatedChunks;
	window
		.fetch( `/calypso/evergreen/translated-chunks.json` )
		.then( response => response.json() )
		.then( data => {
			translatedChunks = data;

			translationChunksQueue.forEach( ( { id, path } ) => {
				if ( translatedChunks.includes( id ) ) {
					fetchTranslationChunk( path );
				}
			} );
		} );

	if ( '__requireChunkCallback__' in window ) {
		window.__requireChunkCallback__.add( ( chunkId, promises, publicPath ) => {
			const translationChunkName = `${ chunkId }`;
			const translationChunkPath = `${ publicPath }languages/${ translationChunkName }.json`; // @todo replace with actual translation path

			if ( ! translatedChunks ) {
				translationChunksQueue.push( {
					id: chunkId,
					path: translationChunkPath,
				} );

				return;
			}

			if ( translatedChunks.includes( chunkId ) ) {
				promises.push( fetchTranslationChunk( translationChunkPath ) );
			}
		} );
	}

	// If user is logged out and translations are not boostrapped, we assume default locale
};
