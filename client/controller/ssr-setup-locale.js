// eslint-disable-next-line import/no-nodejs-modules
import { readFile } from 'fs/promises';
import { getLanguage } from '@automattic/languages';
import getAssetFilePath from 'calypso/lib/get-asset-file-path';
import config from 'calypso/server/config';
import { setLocaleRawData } from 'calypso/state/ui/language/actions';

export function ssrSetupLocaleMiddleware() {
	const translationsCache = {};

	return function ssrSetupLocale( context, next ) {
		function resetLocaleData() {
			const localeDataPlaceholder = { '': {} };
			context.store.dispatch( setLocaleRawData( localeDataPlaceholder ) );
			next();
		}

		if ( ! context.params.lang ) {
			resetLocaleData();
			return;
		}

		if ( ! config( 'magnificent_non_en_locales' ).includes( context.params.lang ) ) {
			context.res.redirect( context.path.replace( `/${ context.params.lang }`, '' ) );
			return;
		}

		const language = getLanguage( context.params.lang );
		if ( ! language ) {
			next();
		}

		context.lang = language.langSlug;
		context.isRTL = language.rtl ? true : false;

		const cachedTranslations = translationsCache[ context.lang ];
		if ( typeof cachedTranslations !== 'undefined' ) {
			context.store.dispatch( setLocaleRawData( cachedTranslations ) );
			next();
		} else {
			readFile( getAssetFilePath( `languages/${ context.lang }-v1.1.json` ), 'utf-8' )
				.then( ( data ) => {
					const translations = JSON.parse( data );

					context.store.dispatch( setLocaleRawData( translations ) );
					translationsCache[ context.lang ] = translations;
					next();
				} )
				.catch( resetLocaleData );
		}
	};
}
