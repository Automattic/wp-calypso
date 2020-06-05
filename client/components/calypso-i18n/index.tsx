/**
 * External dependencies
 */
import React, { useEffect } from 'react';
import { setLocaleData } from '@wordpress/i18n';
import { useI18n, I18nProvider } from '@automattic/react-i18n';
import type { Site as SiteStore, User as UserStore } from '@automattic/data-stores';
import { subscribe, select } from '@wordpress/data';

/**
 * Internal dependencies
 */
import {
	getLanguageFile,
	switchWebpackCSS,
	getLanguageManifestFile,
	getTranslationChunkFile,
} from 'lib/i18n-utils/switch-locale';
import config from 'config';
import { getUrlParts } from 'lib/url/url-parts';
import { USER_STORE } from 'landing/gutenboarding/stores/user'; // TODO: should this be imported from somewhere else?

type User = UserStore.CurrentUser;
type Site = SiteStore.SiteDetails;

interface AppWindow extends Window {
	currentUser?: User;
	i18nLocaleStrings?: string;
	installedChunks?: string[];
	__requireChunkCallback__?: {
		add( callback: Function ): void;
		getInstalledChunks(): string[];
	};
	BUILD_TARGET?: string;
}
declare const window: AppWindow;

const DEFAULT_LOCALE_SLUG: string = config( 'i18n_default_locale_slug' );
const USE_TRANSLATION_CHUNKS: string =
	config.isEnabled( 'use-translation-chunks' ) ||
	getUrlParts( document.location.href ).searchParams.has( 'useTranslationChunks' );

export const CalypsoI18nProvider: React.FunctionComponent< {
	initialLocaleData: any;
} > = ( { children, initialLocaleData } ) => {
	const [ cachedLocaleData, setCachedLocaleData ] = React.useState( initialLocaleData );

	useEffect( () => {
		let isSubscribed = true;
		getLocale().then(
			( [ userLocale, { translatedChunks, ...localeData } ]: ( string | any )[] ) => {
				if ( isSubscribed ) {
					setCachedLocaleData( localeData );
				}

				if ( USE_TRANSLATION_CHUNKS ) {
					setupTranslationChunks( userLocale, translatedChunks );
				}
			}
		);
		// TODO: handle errors
		return () => {
			isSubscribed = false;
		};
	}, [] );

	useEffect( () => {
		setLocaleData( cachedLocaleData );
	}, [ cachedLocaleData ] );

	useRTLCSS();

	return <I18nProvider localeData={ cachedLocaleData }>{ children }</I18nProvider>;
};

function useRTLCSS() {
	const { isRTL } = useI18n();
	const rtl = isRTL();
	useEffect( () => {
		switchWebpackCSS( rtl );
	}, [ rtl ] );
	return null;
}

async function getLocaleData( locale: string ) {
	if ( locale === DEFAULT_LOCALE_SLUG ) {
		return {};
	}

	if ( USE_TRANSLATION_CHUNKS ) {
		const manifest = await getLanguageManifestFile( locale, window.BUILD_TARGET );
		const localeData = {
			...manifest.locale,
			translatedChunks: manifest.translatedChunks,
		};
		return localeData;
	}

	return getLanguageFile( locale );
}

/**
 * Load the user's locale
 *
 * 1. If i18nLocalStrings is present use those strings and data.
 * 2. If we have a currentUser object, use that locale to fetch data.
 * 3. Fetch the current user and use language to fetch data.
 * 4. If we have a URL locale slug, fetch and use data.
 * 5. Fallback to "en" locale without data.
 *
 * @returns Tuple of locale slug and locale data
 */
async function getLocale(): Promise< [ string, object ] > {
	// Bootstraped locale
	if ( window.i18nLocaleStrings ) {
		const bootstrappedLocaleData = JSON.parse( window.i18nLocaleStrings );
		return [ bootstrappedLocaleData[ '' ].localeSlug, bootstrappedLocaleData ];
	}

	// User without bootstrapped locale
	const user = window.currentUser || ( await waitForCurrentUser() );

	if ( ! user ) {
		return [ DEFAULT_LOCALE_SLUG, {} ];
	}
	const localeSlug: string = getLocaleFromUser( user );

	const data = await getLocaleData( localeSlug );
	return [ localeSlug, data ];
}

function waitForCurrentUser(): Promise< User | undefined > {
	let unsubscribe: () => void = () => undefined;
	return new Promise< User | undefined >( ( resolve ) => {
		unsubscribe = subscribe( () => {
			const currentUser = select( USER_STORE ).getCurrentUser();
			if ( currentUser ) {
				resolve( currentUser );
			}
			if ( ! select( 'core/data' ).isResolving( USER_STORE, 'getCurrentUser' ) ) {
				resolve( undefined );
			}
		} );
		select( USER_STORE ).getCurrentUser();
	} ).finally( unsubscribe );
}

function getLocaleFromUser( user: User ): string {
	return user.locale_variant || user.localeVariant || user.language || user.localeSlug;
}

async function setupTranslationChunks( localeSlug: string, translatedChunks: string[] = [] ) {
	if ( ! window.__requireChunkCallback__ ) {
		return;
	}

	interface TranslationChunksCache {
		[ propName: string ]: undefined | boolean;
	}
	const loadedTranslationChunks: TranslationChunksCache = {};
	const loadTranslationForChunkIfNeeded = async ( chunkId: string ) => {
		if ( ! translatedChunks.includes( chunkId ) || loadedTranslationChunks[ chunkId ] ) {
			return;
		}

		return getTranslationChunkFile( chunkId, localeSlug, window.BUILD_TARGET ).then(
			( translations ) => {
				setLocaleData( translations );
				loadedTranslationChunks[ chunkId ] = true;
			}
		);
	};

	const installedChunks = new Set(
		( window.installedChunks || [] ).concat( window.__requireChunkCallback__.getInstalledChunks() )
	);

	await Promise.all(
		[ ...installedChunks ].map( ( chunkId ) => loadTranslationForChunkIfNeeded( chunkId ) )
	);

	interface RequireChunkCallbackParameters {
		publicPath: string;
		scriptSrc: string;
	}

	window.__requireChunkCallback__.add(
		( { publicPath, scriptSrc }: RequireChunkCallbackParameters, promises: any[] ) => {
			const chunkId = scriptSrc.replace( publicPath, '' ).replace( /\.js$/, '' );

			promises.push( loadTranslationForChunkIfNeeded( chunkId ) );
		}
	);
}
