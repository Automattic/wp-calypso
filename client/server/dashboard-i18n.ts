// eslint-disable-next-line import/no-nodejs-modules
import { readFile } from 'fs/promises';
import { type Request, type RequestHandler } from 'express';
import { I18N } from 'i18n-calypso';
import { getUserLanguage } from 'calypso/dashboard/app/shared-locale-loader';
import getAssetFilePath from 'calypso/lib/get-asset-file-path';
import { getLanguageFile } from 'calypso/lib/i18n-utils/switch-locale';

type LocaleData = Parameters< I18N[ 'setLocale' ] >[ 0 ];

const localeDataCache = new Map< string, LocaleData >();

type CalypsoRequest = Request & {
	context?: { user?: Parameters< typeof getUserLanguage >[ 0 ]; i18nCalypso?: I18N };
};

/**
 * Creates a per-request i18n-calypso instance loaded with the user's locale so
 * the server-side render of the interim omnibar emits translated strings
 * without mutating any global singleton. The instance is stored on
 * `req.context.i18nCalypso` and provided to the React tree via
 * `I18NContext.Provider`.
 */
export const loadDashboardLocaleData: RequestHandler = ( req, res, next ) => {
	const user = ( req as CalypsoRequest ).context?.user;
	const language = getUserLanguage( user );
	if ( ! language || language === 'en' ) {
		next();
		return;
	}

	const apply = ( data: LocaleData ) => {
		const i18n = new I18N();
		i18n.setLocale( data );
		const ctx = ( req as CalypsoRequest ).context;
		if ( ctx ) {
			ctx.i18nCalypso = i18n;
		}
		next();
	};

	const cached = localeDataCache.get( language );
	if ( cached ) {
		apply( cached );
		return;
	}

	readFile( getAssetFilePath( `languages/${ language }-v1.1.json` ), 'utf-8' )
		.then( ( raw ) => JSON.parse( raw ) as LocaleData )
		.catch( () => getLanguageFile( language ) as unknown as Promise< LocaleData > )
		.then( ( data ) => {
			localeDataCache.set( language, data );
			apply( data );
		} )
		.catch( () => {
			next();
		} );
};
