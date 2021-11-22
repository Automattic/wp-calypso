// eslint-disable-next-line import/no-nodejs-modules
import { readFile } from 'fs/promises';
import i18n from 'i18n-calypso';
import getAssetFilePath from 'calypso/lib/get-asset-file-path';
import { getLanguage } from 'calypso/lib/i18n-utils';
import config from 'calypso/server/config';
import { setLocale } from 'calypso/state/ui/language/actions';

export function ssrSetupLocaleMiddleware() {
	const translationsCache = {};

	return function ssrSetupLocale( context, next ) {
		function resetLocaleData() {
			i18n.setLocale( null );
			context.store.dispatch( setLocale( i18n.getLocaleSlug() ) );
		}

		function setLocaleData( localeData ) {
			i18n.setLocale( localeData );
			const { localeSlug, localeVariant } = localeData[ '' ];
			context.store.dispatch( setLocale( localeSlug, localeVariant ) );
		}

		if ( ! context.params.lang ) {
			resetLocaleData();
			next();
			return;
		}

		if ( ! config( 'magnificent_non_en_locales' ).includes( context.params.lang ) ) {
			context.res.redirect( context.path.replace( `/${ context.params.lang }`, '' ) );
			return;
		}

		const language = getLanguage( context.params.lang );
		if ( ! language ) {
			resetLocaleData();
			next();
			return;
		}

		context.lang = language.langSlug;
		context.isRTL = language.rtl ? true : false;

		const cachedTranslations = translationsCache[ context.lang ];
		if ( typeof cachedTranslations !== 'undefined' ) {
			setLocaleData( cachedTranslations );
			next();
		} else {
			readFile( getAssetFilePath( `languages/${ context.lang }-v1.1.json` ), 'utf-8' )
				.then( ( data ) => {
					const translations = JSON.parse( data );
					translationsCache[ context.lang ] = translations;
					setLocaleData( translations );
					next();
				} )
				.catch( () => {
					resetLocaleData();
					next();
				} );
		}
	};
}
