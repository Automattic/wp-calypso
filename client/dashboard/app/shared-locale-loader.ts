import { isTranslatedIncompletely } from '@automattic/i18n-utils';
import { type LocaleData } from '@wordpress/i18n';
import type { User } from '@automattic/api-core';

const dataPromises = new Map< string, Promise< LocaleData > >();

/**
 * Derives the effective locale slug for a user. Called by both the dashboard
 * SSR middleware (`loadDashboardLocaleData`) and the client hydration path
 * (`loadOmnibar`), so the two agree on which locale file to load:
 *
 *   - Falls back to English when the user has
 *     `use_fallback_for_incomplete_languages` enabled and their language
 *     is not fully translated (checked against `localeVariant || localeSlug`,
 *     matching `setUpLoggedInRoute`).
 *   - Prefers `localeVariant` (e.g. `es-mx`) so users get region-specific
 *     translations, falling back to `localeSlug`, then to the REST
 *     `locale_variant` / `language` fields for non-bootstrapped sessions.
 */
export function getUserLanguage( user: User | null | undefined ): string {
	if ( ! user ) {
		return 'en';
	}

	const slug = user.localeVariant || user.localeSlug || user.locale_variant || user.language;
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
 * Fetches the user's locale JSON from the Calypso CDN and returns a cached
 * promise per language, so concurrent callers share a single network
 * request. Returns `undefined` for English (nothing to load) or on error.
 *
 * Pure cache + fetch — no singleton mutation. Callers are responsible for
 * applying the result to `defaultI18n` (typically via `resetLocaleData`),
 * gated on their own cancellation state.
 */
export function loadUserLocaleData( language: string ): Promise< LocaleData | undefined > {
	if ( ! language || language === 'en' ) {
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

	return dataPromise.catch( () => {
		// Drop the cached rejection so a later call can retry.
		dataPromises.delete( language );
		return undefined;
	} );
}
