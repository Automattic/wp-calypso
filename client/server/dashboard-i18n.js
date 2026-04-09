// eslint-disable-next-line import/no-nodejs-modules
import { readFile } from 'fs/promises';
import { defaultI18n } from '@wordpress/i18n';
import getAssetFilePath from 'calypso/lib/get-asset-file-path';
import { getLanguageFile } from 'calypso/lib/i18n-utils/switch-locale';

const localeDataCache = new Map();

/**
 * Populates `defaultI18n` with the bootstrapped user's locale for the duration
 * of the request's render, so the server-side render of the interim omnibar
 * emits translated strings. Loads from `public/languages/` when available and
 * falls back to the Calypso CDN otherwise.
 */
export function loadDashboardLocaleData( req, res, next ) {
	const language = req.context?.lang;
	if ( ! language || language === 'en' ) {
		defaultI18n.resetLocaleData();
		next();
		return;
	}

	const apply = ( data ) => {
		defaultI18n.setLocaleData( data );
		next();
	};

	const cached = localeDataCache.get( language );
	if ( cached ) {
		apply( cached );
		return;
	}

	readFile( getAssetFilePath( `languages/${ language }-v1.1.json` ), 'utf-8' )
		.then( ( raw ) => JSON.parse( raw ) )
		.catch( () => getLanguageFile( language ) )
		.then( ( data ) => {
			localeDataCache.set( language, data );
			apply( data );
		} )
		.catch( () => {
			defaultI18n.resetLocaleData();
			next();
		} );
}
