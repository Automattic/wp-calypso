import { defaultI18n, type LocaleData } from '@wordpress/i18n';
import type { User } from '@automattic/api-core';

const dataPromises = new Map< string, Promise< LocaleData > >();
let appliedLanguage: string | null = null;

export function getUserLanguage( user: User | null | undefined ): string {
	if ( ! user ) {
		return 'en';
	}
	return user.localeVariant || user.localeSlug || user.locale_variant || user.language || 'en';
}

/**
 * Fetches the user's locale JSON from the Calypso CDN and applies it to the
 * `defaultI18n` singleton. Returns a cached raw-data promise per language so
 * concurrent callers share a single network request. On each call, if the
 * currently-applied locale differs from what was requested, the data is
 * re-applied via `resetLocaleData` — this keeps in-session language switches
 * clean instead of merging old + new translations.
 */
export function loadUserLocale( language: string ): Promise< LocaleData | undefined > {
	if ( ! language || language === 'en' ) {
		if ( appliedLanguage !== 'en' ) {
			defaultI18n.resetLocaleData();
			appliedLanguage = 'en';
		}
		return Promise.resolve( undefined );
	}

	let dataPromise = dataPromises.get( language );
	if ( ! dataPromise ) {
		dataPromise = fetch( `https://widgets.wp.com/languages/calypso/${ language }-v1.1.json` ).then(
			( response ) => {
				if ( ! response.ok ) {
					throw new Error( `Failed to load locale data for ${ language }` );
				}
				return response.json() as Promise< LocaleData >;
			}
		);
		dataPromises.set( language, dataPromise );
	}

	return dataPromise
		.then( ( data ) => {
			if ( appliedLanguage !== language ) {
				defaultI18n.resetLocaleData( data );
				appliedLanguage = language;
			}
			return data;
		} )
		.catch( () => undefined );
}
