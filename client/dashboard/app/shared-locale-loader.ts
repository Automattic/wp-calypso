import { defaultI18n, type LocaleData } from '@wordpress/i18n';
import type { User } from '@automattic/api-core';

const promises = new Map< string, Promise< LocaleData | undefined > >();

export function getUserLanguage( user: User | null | undefined ): string {
	if ( ! user ) {
		return 'en';
	}
	return user.localeVariant || user.localeSlug || user.locale_variant || user.language || 'en';
}

/**
 * Fetches the user's locale JSON from the Calypso CDN and applies it to the
 * `defaultI18n` singleton. Returns a cached promise per language so concurrent
 * callers share a single network request.
 */
export function loadUserLocale( language: string ): Promise< LocaleData | undefined > {
	if ( ! language || language === 'en' ) {
		// Clear any previously-loaded locale so switching to English
		// mid-session doesn't leave stale translations in `defaultI18n`.
		defaultI18n.resetLocaleData();
		return Promise.resolve( undefined );
	}

	const existing = promises.get( language );
	if ( existing ) {
		return existing;
	}

	const promise = fetch( `https://widgets.wp.com/languages/calypso/${ language }-v1.1.json` )
		.then( ( response ) => {
			if ( ! response.ok ) {
				throw new Error( `Failed to load locale data for ${ language }` );
			}
			return response.json() as Promise< LocaleData >;
		} )
		.then( ( data ) => {
			defaultI18n.setLocaleData( data );
			return data;
		} )
		.catch( () => undefined );

	promises.set( language, promise );
	return promise;
}
