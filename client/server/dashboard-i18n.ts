// eslint-disable-next-line import/no-nodejs-modules
import { readFile } from 'fs/promises';
import { defaultI18n, type LocaleData } from '@wordpress/i18n';
import { type Request, type RequestHandler } from 'express';
import getAssetFilePath from 'calypso/lib/get-asset-file-path';
import { getLanguageFile } from 'calypso/lib/i18n-utils/switch-locale';

const localeDataCache = new Map< string, LocaleData >();

type CalypsoRequest = Request & { context?: { lang?: string } };

/**
 * Populates `defaultI18n` with the bootstrapped user's locale for the duration
 * of the request's render, so the server-side render of the interim omnibar
 * emits translated strings. Loads from `public/languages/` when available and
 * falls back to the Calypso CDN otherwise.
 */
export const loadDashboardLocaleData: RequestHandler = ( req, res, next ) => {
	const language = ( req as CalypsoRequest ).context?.lang;
	if ( ! language || language === 'en' ) {
		defaultI18n.resetLocaleData();
		next();
		return;
	}

	const apply = ( data: LocaleData ) => {
		defaultI18n.setLocaleData( data );
		next();
	};

	const cached = localeDataCache.get( language );
	if ( cached ) {
		apply( cached );
		return;
	}

	readFile( getAssetFilePath( `languages/${ language }-v1.1.json` ), 'utf-8' )
		.then( ( raw ) => JSON.parse( raw ) as LocaleData )
		.catch( () => getLanguageFile( language ) as Promise< LocaleData > )
		.then( ( data ) => {
			localeDataCache.set( language, data );
			apply( data );
		} )
		.catch( () => {
			defaultI18n.resetLocaleData();
			next();
		} );
};
