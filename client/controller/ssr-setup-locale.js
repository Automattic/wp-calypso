/**
 * External dependencies
 */
/* eslint-disable import/no-nodejs-modules */
import { readFile } from 'fs/promises';
/* eslint-enable import/no-nodejs-modules */

/**
 * Internal dependencies
 */
import getAssetFilePath from 'calypso/lib/get-asset-file-path';
import { getLanguage } from 'calypso/lib/i18n-utils';
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
			readFile(
				getAssetFilePath( context.target, `languages/${ context.lang }-v1.1.json` ),
				'utf-8'
			)
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
