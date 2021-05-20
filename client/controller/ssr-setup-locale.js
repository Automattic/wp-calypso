/**
 * External dependencies
 */
/* eslint-disable import/no-nodejs-modules */
import fs from 'fs';
/* eslint-enable import/no-nodejs-modules */
import { localesToSubdomains } from '@automattic/i18n-utils';

/**
 * Internal dependencies
 */
import getAssetFilePath from 'calypso/lib/get-asset-file-path';
import { getLanguage } from 'calypso/lib/i18n-utils';
import { setLocaleRawData } from 'calypso/state/ui/language/actions';

export function ssrSetupLocaleMiddleware() {
	const translationsCache = {};

	return function ssrSetupLocale( context, next ) {
		if ( ! context.params.lang ) {
			const localeDataPlaceholder = { '': {} };
			context.store.dispatch( setLocaleRawData( localeDataPlaceholder ) ); // Reset to default locale

			next();
			return;
		}
		const subdomainsToLocales = Object.entries( localesToSubdomains ).reduce(
			( acc, [ key, value ] ) => {
				return {
					...acc,
					[ value ]: key,
				};
			},
			{}
		);
		const langSlug = subdomainsToLocales[ context.params.lang ] || context.params.lang;
		const language = getLanguage( langSlug );

		if ( language ) {
			context.lang = language.langSlug;
			context.isRTL = language.rtl ? true : false;

			if ( typeof translationsCache[ context.lang ] === 'undefined' ) {
				translationsCache[ context.lang ] = JSON.parse(
					fs.readFileSync(
						getAssetFilePath( context.target, `${ context.lang }-v1.1.json` ),
						'utf-8'
					)
				);
			}

			const translations = translationsCache[ context.lang ];

			context.store.dispatch( setLocaleRawData( translations ) );
		}

		next();
	};
}
