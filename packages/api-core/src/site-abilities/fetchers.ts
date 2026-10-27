import { wpcom } from '../wpcom-fetcher';
import type { SiteAbility } from './types';

// Core's collection cap. A full page is the only "maybe more" signal: the proxy
// relays the site's body but not its X-WP-TotalPages header.
const PER_PAGE = 100;
// Bounds the fetch when a site publishes a large catalog.
const MAX_PAGES = 3;

/**
 * Fetch the abilities a Jetpack-connected site publishes through the WP
 * Abilities API, via the Jetpack REST proxy. Rejects when the site is
 * unreachable or too old to expose the endpoint.
 *
 * `wpLocale` is the WP-locale code for the viewer's UI language (e.g. `en_US`),
 * passed as `_locale` so labels and descriptions arrive in it rather than the
 * site's default language. Falls back to `_locale=user`.
 */
export async function fetchSiteAbilities(
	siteId: number,
	wpLocale?: string
): Promise< SiteAbility[] > {
	const abilities: SiteAbility[] = [];

	for ( let page = 1; page <= MAX_PAGES; page++ ) {
		const { data } = await wpcom.req.get( `/jetpack-blogs/${ siteId }/rest-api/`, {
			path: '/wp-abilities/v1/abilities',
			query: JSON.stringify( { per_page: PER_PAGE, page, _locale: wpLocale || 'user' } ),
		} );

		if ( ! Array.isArray( data ) ) {
			break;
		}
		abilities.push( ...data );

		if ( data.length < PER_PAGE ) {
			break;
		}
	}

	return abilities;
}
