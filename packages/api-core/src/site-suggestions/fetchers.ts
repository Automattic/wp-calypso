import { wpcom } from '../wpcom-fetcher';
import type { SiteSuggestion } from './types';

/**
 * Site titles suggested by the server, used to seed a new site's address.
 */
export async function fetchSiteSuggestions(): Promise< SiteSuggestion[] > {
	const { suggestions } = await wpcom.req.get( {
		apiNamespace: 'wpcom/v2',
		path: '/site-suggestions',
	} );

	return suggestions;
}
