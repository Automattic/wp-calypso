// eslint-disable-next-line import/no-nodejs-modules
import { readFile } from 'fs/promises';
import { defaultI18n } from '@wordpress/i18n';
import { I18N } from 'i18n-calypso';
import getAssetFilePath from 'calypso/lib/get-asset-file-path';
import { getLanguageFile } from 'calypso/lib/i18n-utils/switch-locale';
import config from 'calypso/server/config';
import { LOCALE_SET } from 'calypso/state/action-types';

export function ssrSetupLocaleMiddleware() {
	const translationsCache = {};

	return function ssrSetupLocale( context, next ) {
		function setLocaleData( localeData ) {
			const i18n = new I18N();
			i18n.setLocale( localeData );
			if ( localeData ) {
				defaultI18n.setLocaleData( localeData );
			} else {
				defaultI18n.resetLocaleData();
			}

			const localeSlug = i18n.getLocaleSlug();
			const localeVariant = i18n.getLocaleVariant();
			context.store.dispatch( { type: LOCALE_SET, localeSlug, localeVariant } );
			context.lang = localeVariant || localeSlug;
			context.i18n = i18n;
			next();
		}

		const { lang } = context.params;

		if ( ! lang ) {
			setLocaleData( null );
			return;
		}

		if ( ! config( 'magnificent_non_en_locales' ).includes( lang ) ) {
			context.res.redirect( context.path.replace( `/${ lang }`, '' ) );
			return;
		}

		const cachedTranslations = translationsCache[ lang ];
		if ( cachedTranslations ) {
			setLocaleData( cachedTranslations );
		} else {
			readFile( getAssetFilePath( `languages/${ lang }-v1.1.json` ), 'utf-8' )
				.then( ( data ) => JSON.parse( data ) )
				// Fall back to the remote one if the local translation file is not found.
				.catch( () => getLanguageFile( lang ) )
				.then( ( translations ) => {
					translationsCache[ lang ] = translations;
					setLocaleData( translations );
				} )
				.catch( () => setLocaleData( null ) );
		}
	};
}
