/**
 * External dependencies
 */
import { get } from 'lodash';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import config from 'config';
import { getLanguageSlugs, isDefaultLocale } from 'lib/i18n-utils';
import {
	loadUserUndeployedTranslations,
	getLanguageManifestFile,
	getTranslationChunkFile,
} from 'lib/i18n-utils/switch-locale';
import { getUrlParts } from 'lib/url/url-parts';
import { setLocale, setLocaleRawData } from 'state/ui/language/actions';

const setupTranslationChunks = async ( localeSlug, reduxStore ) => {
	const { translatedChunks, locale } = await getLanguageManifestFile(
		localeSlug,
		window.BUILD_TARGET
	);

	reduxStore.dispatch( setLocaleRawData( locale ) );

	const loadedTranslationChunks = {};
	const loadTranslationForChunkIfNeeded = ( chunkId ) => {
		if ( ! translatedChunks.includes( chunkId ) || loadedTranslationChunks[ chunkId ] ) {
			return;
		}

		return getTranslationChunkFile( chunkId, localeSlug, window.BUILD_TARGET ).then(
			( translations ) => {
				i18n.addTranslations( translations );
				loadedTranslationChunks[ chunkId ] = true;
			}
		);
	};
	const installedChunks = new Set(
		( window.installedChunks || [] ).concat( window.__requireChunkCallback__.getInstalledChunks() )
	);

	installedChunks.forEach( ( chunkId ) => {
		loadTranslationForChunkIfNeeded( chunkId );
	} );

	window.__requireChunkCallback__.add( ( { publicPath, scriptSrc }, promises ) => {
		const chunkId = scriptSrc.replace( publicPath, '' ).replace( /\.js$/, '' );

		promises.push( loadTranslationForChunkIfNeeded( chunkId ) );
	} );
};

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

	const useTranslationChunks =
		config.isEnabled( 'use-translation-chunks' ) ||
		getUrlParts( document.location.href ).searchParams.has( 'useTranslationChunks' );

	if ( useTranslationChunks && '__requireChunkCallback__' in window ) {
		const userLocaleSlug = currentUser && currentUser.localeSlug;
		const lastPathSegment = window.location.pathname.substr(
			window.location.pathname.lastIndexOf( '/' ) + 1
		);
		const pathLocaleSlug =
			getLanguageSlugs().includes( lastPathSegment ) &&
			! isDefaultLocale( lastPathSegment ) &&
			lastPathSegment;
		const localeSlug = userLocaleSlug || pathLocaleSlug;

		if ( localeSlug ) {
			setupTranslationChunks( localeSlug, reduxStore );
		}
	}

	// If user is logged out and translations are not boostrapped, we assume default locale
};
