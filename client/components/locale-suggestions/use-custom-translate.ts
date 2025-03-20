import config from '@automattic/calypso-config';
import { getUrlParts } from '@automattic/calypso-url';
import { useEffect, useState } from '@wordpress/element';
import debugFactory from 'debug';
import { translate } from 'i18n-calypso';
import I18N from 'i18n-calypso/src/i18n';
import {
	getLanguageFile,
	getLanguageManifestFile,
	getTranslationChunkFile,
	getInstalledChunks,
} from 'calypso/lib/i18n-utils/switch-locale';

const debug = debugFactory( 'calypso:locale-suggestions:use-custom-translate' );

/**
 * Load translations for a specific locale
 * This should be consolidated with the switch-locale library
 */
const loadTranslations = async ( customI18n: I18N, localeSlug: string ): Promise< void > => {
	const useTranslationChunks =
		config.isEnabled( 'use-translation-chunks' ) ||
		getUrlParts( document.location.href ).searchParams.has( 'useTranslationChunks' );

	try {
		if ( useTranslationChunks ) {
			const manifest = await getLanguageManifestFile( localeSlug );

			if ( ! manifest?.locale || ! manifest?.translatedChunks ) {
				debug( 'No locale data in manifest for', localeSlug );
				return;
			}

			customI18n.setLocale( manifest.locale );

			const translatedInstalledChunks = getInstalledChunks().filter(
				( chunkId ) => manifest.translatedChunks?.includes( chunkId )
			);

			await Promise.all(
				translatedInstalledChunks.map( async ( chunkId ) => {
					try {
						const translations = await getTranslationChunkFile( chunkId, localeSlug );
						if ( translations ) {
							customI18n.addTranslations( translations );
						}
					} catch ( error ) {
						debug( 'Failed to load translation chunk:', error );
					}
				} )
			);
		} else {
			const translations = await getLanguageFile( localeSlug );
			if ( translations ) {
				customI18n.setLocale( translations );
			}
		}
	} catch ( error ) {
		debug( 'Failed to load translations:', error );
	}
};

/**
 * React hook that provides a translate function for a specific locale
 */
export const useCustomTranslate = ( localeSlug?: string ) => {
	const [ customTranslate, setCustomTranslate ] = useState< typeof translate | null >( null );

	useEffect( () => {
		if ( ! localeSlug ) {
			return;
		}

		const customI18n = new I18N();
		const handleChange = () => {
			setCustomTranslate( () => customI18n.translate.bind( customI18n ) as typeof translate );
		};

		customI18n.configure( { defaultLocaleSlug: localeSlug } );
		customI18n.on( 'change', handleChange );

		// Skip loading translations for English (default locale)
		if ( localeSlug === 'en' ) {
			customI18n.setLocale( { '': { localeSlug: 'en' } } );
			return;
		}

		loadTranslations( customI18n, localeSlug );

		return () => {
			customI18n.off( 'change', handleChange );
		};
	}, [ localeSlug ] );

	return customTranslate;
};
