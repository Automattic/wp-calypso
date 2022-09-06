import config from '@automattic/calypso-config';
import { getUrlParts } from '@automattic/calypso-url';
import { LocaleProvider } from '@automattic/i18n-utils';
import { defaultI18n, LocaleData } from '@wordpress/i18n';
import { I18nProvider } from '@wordpress/react-i18n';
import * as React from 'react';
import { useLocation } from 'react-router-dom';
import {
	getLanguageFile,
	getLanguageManifestFile,
	getTranslationChunkFile,
} from '../../lib/i18n-utils/switch-locale';
import type { User } from '@automattic/data-stores';

const DEFAULT_LOCALE_SLUG: string = config( 'i18n_default_locale_slug' );
const USE_TRANSLATION_CHUNKS: boolean =
	config.isEnabled( 'use-translation-chunks' ) ||
	getUrlParts( document.location.href ).searchParams.has( 'useTranslationChunks' );

interface AppWindow extends Window {
	currentUser?: User.CurrentUser;
	BUILD_TARGET?: string;
	installedChunks?: string[];
	i18nLocaleStrings?: string;
	__requireChunkCallback__?: {
		add( callback: Function ): void; // eslint-disable-line @typescript-eslint/ban-types
		getInstalledChunks(): string[];
	};
	updateLocale: ( newLocale: string ) => Promise< void >; // fixme: this is just for demonstration purposes
}

declare const window: AppWindow;

export type ChangeLocaleFunction = ( newLocale: string ) => void;

// eslint-disable-next-line @typescript-eslint/no-empty-function
const ChangeLocaleContext = React.createContext< ChangeLocaleFunction >( () => {} );

export const ChangeLocaleContextConsumer = ChangeLocaleContext.Consumer;

export const StepperUrlLocaleContext: React.FunctionComponent = ( { children } ) => {
	const [ contextLocaleData, setContextLocaleData ] = React.useState< LocaleData | undefined >();
	const [ localeDataLoaded, setLocaleDataLoaded ] = React.useState( false );
	const localeSlug = contextLocaleData?.[ '' ]?.localeSlug ?? DEFAULT_LOCALE_SLUG;
	const urlSlug = new URLSearchParams( useLocation().search ).get( 'locale' ) || localeSlug;

	const setLocale = ( newLocaleData: LocaleData | undefined ) => {
		defaultI18n.resetLocaleData( newLocaleData );
		setContextLocaleData( newLocaleData );
		setLocaleDataLoaded( true );
	};

	const changeLocale = async ( newLocale: string ) => {
		if ( newLocale === DEFAULT_LOCALE_SLUG ) {
			setLocale( undefined );
		}
		try {
			const { translatedChunks, ...localeData } = await getLocaleData( newLocale );

			if ( USE_TRANSLATION_CHUNKS ) {
				const chunkedLocaleData = await setupTranslationChunks( newLocale, translatedChunks );
				setLocale( { ...chunkedLocaleData, ...localeData } );
			} else {
				setLocale( localeData );
			}
		} catch ( error ) {
			setLocale( undefined );
		}
	};

	React.useEffect( () => {
		const userLocale = urlSlug;
		changeLocale( userLocale );
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<ChangeLocaleContext.Provider value={ changeLocale }>
			<LocaleProvider localeSlug={ localeSlug }>
				<I18nProvider i18n={ defaultI18n }>{ localeDataLoaded ? children : null }</I18nProvider>
			</LocaleProvider>
		</ChangeLocaleContext.Provider>
	);
};

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

		return getTranslationChunkFile( chunkId, localeSlug ).then( ( translations ) => {
			loadedTranslationChunks[ chunkId ] = true;
			return translations;
		} );
	};

	const installedChunks = new Set(
		( window.installedChunks || [] ).concat( window.__requireChunkCallback__.getInstalledChunks() )
	);

	const localeData = await Promise.all(
		[ ...installedChunks ].map( ( chunkId: string ) => loadTranslationForChunkIfNeeded( chunkId ) )
	).then( ( values ) =>
		values.reduce( ( localeDataObj, chunk ) => Object.assign( {}, localeDataObj, chunk ) )
	);

	return localeData;
}

async function getLocaleData( locale: string ) {
	if ( locale === DEFAULT_LOCALE_SLUG ) {
		return {};
	}

	if ( USE_TRANSLATION_CHUNKS ) {
		const manifest = await getLanguageManifestFile( locale );
		const localeData = {
			...manifest.locale,
			translatedChunks: manifest.translatedChunks,
		};
		return localeData;
	}

	return getLanguageFile( locale );
}

// function test() {
// 	return new URLSearchParams( useLocation().search ).has( 'new' );
// }
