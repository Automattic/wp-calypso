// eslint-disable-next-line import/no-nodejs-modules
import { readFile } from 'fs/promises';
import { defaultI18n } from '@wordpress/i18n';
import getAssetFilePath from 'calypso/lib/get-asset-file-path';

const localeDataCache = new Map();

/**
 * Express middleware that loads the bootstrapped user's locale data from disk
 * and applies it to the global `defaultI18n` singleton from `@wordpress/i18n`
 * for the duration of the request's render. The data is also stashed on
 * `req.context.localeData` so the document component can inline it into the
 * HTML response, allowing the client to apply the same data before any
 * components render — which is what makes hydration of the SSR-translated
 * interim omnibar match.
 *
 * Falls back silently to the default English locale if the locale file is
 * missing or unreadable; the client-side `I18nProvider` will fetch the JSON
 * from the CDN as a backup.
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
		req.context.localeData = data;
		next();
	};

	const cached = localeDataCache.get( language );
	if ( cached ) {
		apply( cached );
		return;
	}

	readFile( getAssetFilePath( `languages/${ language }-v1.1.json` ), 'utf-8' )
		.then( ( raw ) => JSON.parse( raw ) )
		.then( ( data ) => {
			localeDataCache.set( language, data );
			apply( data );
		} )
		.catch( () => {
			defaultI18n.resetLocaleData();
			next();
		} );
}
