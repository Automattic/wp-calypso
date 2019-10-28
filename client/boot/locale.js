/**
 * External dependencies
 */
import { get } from 'lodash';
import debugFactory from 'debug';
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
import { enableLanguageEmpatyhMode } from 'lib/i18n-utils/empathy-mode';

const debug = debugFactory( 'calypso:i18n' );

const setupTranslationChunks = async ( localeSlug, reduxStore ) => {
	const { translatedChunks, locale } = await getLanguageManifestFile(
		localeSlug,
		window.BUILD_TARGET
	).catch( () => {
		debug( `Failed to get language manifest for ${ localeSlug }.` );

		return {};
	} );

	if ( ! locale || ! translatedChunks ) {
		debug(
			`Encountered an error setting up translation chunks for ${ localeSlug }. Falling back to English.`
		);

		return;
	}

	reduxStore.dispatch( setLocaleRawData( locale ) );

	let userTranslations;
	const loadedTranslationChunks = {};
	const loadTranslationForChunkIfNeeded = ( chunkId ) => {
		if ( ! translatedChunks.includes( chunkId ) || loadedTranslationChunks[ chunkId ] ) {
			return;
		}

		return getTranslationChunkFile( chunkId, localeSlug, window.BUILD_TARGET ).then(
			( translations ) => {
				i18n.addTranslations( { ...translations, ...userTranslations } );
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

	const userTranslationsPromise = loadUserUndeployedTranslations( localeSlug );

	if ( userTranslationsPromise ) {
		userTranslationsPromise.then( ( translations ) => {
			userTranslations = translations;
		} );
	}
};

export const setupLocale = ( currentUser, reduxStore ) => {
	const useTranslationChunks =
		config.isEnabled( 'use-translation-chunks' ) ||
		getUrlParts( document.location.href ).searchParams.has( 'useTranslationChunks' );

	enableLanguageEmpatyhMode();

	if ( useTranslationChunks && '__requireChunkCallback__' in window ) {
		const userLocaleSlug = currentUser && currentUser.localeSlug;
		const pathname = window.location.pathname.replace( /\/$/, '' );
		const lastPathSegment = pathname.substr( pathname.lastIndexOf( '/' ) + 1 );
		const pathLocaleSlug =
			getLanguageSlugs().includes( lastPathSegment ) &&
			! isDefaultLocale( lastPathSegment ) &&
			lastPathSegment;
		const localeSlug = userLocaleSlug || pathLocaleSlug;

		if ( localeSlug && ! isDefaultLocale( localeSlug ) ) {
			setupTranslationChunks( localeSlug, reduxStore );
		}
	}

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

	// If user is logged out and translations are not boostrapped, we assume default locale
};
