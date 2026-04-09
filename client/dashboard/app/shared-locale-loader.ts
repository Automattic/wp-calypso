import { isTranslatedIncompletely } from '@automattic/i18n-utils';
import { defaultI18n, type LocaleData } from '@wordpress/i18n';
import type { User } from '@automattic/api-core';

const dataPromises = new Map< string, Promise< LocaleData > >();
let appliedLanguage: string | null = null;

/**
 * Derives the effective locale slug for a user. Mirrors the server's
 * `setUpLoggedInRoute` logic so SSR and client produce the same value:
 *
 *   - Falls back to English when the user has
 *     `use_fallback_for_incomplete_languages` enabled and their language
 *     is not fully translated.
 *   - Otherwise returns the bootstrap-provided `localeSlug` (preferred),
 *     or the REST `locale_variant` / `language` for non-bootstrapped
 *     sessions.
 *
 * The server's incompleteness check uses `localeVariant || localeSlug`,
 * so we mirror that here.
 */
export function getUserLanguage( user: User | null | undefined ): string {
	if ( ! user ) {
		return 'en';
	}

	const slug = user.localeSlug || user.locale_variant || user.language;
	if ( ! slug ) {
		return 'en';
	}

	const checkAgainst = user.localeVariant || slug;
	if ( user.use_fallback_for_incomplete_languages && isTranslatedIncompletely( checkAgainst ) ) {
		return 'en';
	}

	return slug;
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
		.catch( () => {
			// Drop the cached rejection so a later call can retry.
			dataPromises.delete( language );
			// Callers treat `undefined` as English; make `defaultI18n` match.
			if ( appliedLanguage !== 'en' ) {
				defaultI18n.resetLocaleData();
				appliedLanguage = 'en';
			}
			return undefined;
		} );
}
