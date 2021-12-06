// eslint-disable-next-line import/no-nodejs-modules
import { readFile } from 'fs/promises';
import i18n from 'i18n-calypso';
import getAssetFilePath from 'calypso/lib/get-asset-file-path';
import { getLanguage } from 'calypso/lib/i18n-utils';
import config from 'calypso/server/config';
import { LOCALE_SET } from 'calypso/state/action-types';

export function ssrSetupLocaleMiddleware() {
	const translationsCache = {};

	return function ssrSetupLocale( context, next ) {
		function setLocaleData( localeData ) {
			i18n.setLocale( localeData );
			const localeSlug = i18n.getLocaleSlug();
			const localeVariant = i18n.getLocaleVariant();
			context.store.dispatch( { type: LOCALE_SET, localeSlug, localeVariant } );
			context.lang = localeVariant || localeSlug;
			context.isRTL = getLanguage( context.lang )?.rtl ?? false;
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
		if ( typeof cachedTranslations !== 'undefined' ) {
			setLocaleData( cachedTranslations );
		} else {
			readFile( getAssetFilePath( `languages/${ lang }-v1.1.json` ), 'utf-8' )
				.then( ( data ) => {
					const translations = JSON.parse( data );
					translationsCache[ lang ] = translations;
					setLocaleData( translations );
				} )
				.catch( () => {
					setLocaleData( null );
				} );
		}
	};
}
