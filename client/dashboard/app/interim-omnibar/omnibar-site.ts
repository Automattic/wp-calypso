import {
	omnibarCurrentSiteIdQuery,
	queryClient,
	rawUserPreferencesQuery,
	userPreferenceOptimisticMutation,
} from '@automattic/api-queries';
import { MutationObserver } from '@tanstack/react-query';
import type { User } from '@automattic/api-core';

/**
 * Sets the current site id to the query data,
 * and then optimistically updates the recent sites preference.
 */
export async function setOmnibarCurrentSiteId( siteId: number ) {
	queryClient.setQueryData( omnibarCurrentSiteIdQuery().queryKey, siteId );

	const prefs = await queryClient.ensureQueryData( rawUserPreferencesQuery() );
	const recentSites = prefs?.recentSites ?? [];

	if ( siteId === recentSites[ 0 ] ) {
		return;
	}

	// Push the current site id as the most recent site.
	const updated = [ ...new Set( [ siteId, ...recentSites ] ) ].slice( 0, 5 );
	new MutationObserver( queryClient, userPreferenceOptimisticMutation( 'recentSites' ) ).mutate(
		updated
	);
}

/**
 * Returns the id of the site to display in the omnibar, which is the current site,
 * or the most recent site, or the user's primary blog (in that order).
 */
export function getOmnibarSiteId(
	currentSiteId?: number | null,
	recentSiteIds?: number[],
	user?: User
) {
	if ( currentSiteId === undefined ) {
		// If currentSiteId is undefined, it means it is not set yet.
		// Return undefined here to avoid flash when it is finally set.
		return undefined;
	}
	return currentSiteId || recentSiteIds?.[ 0 ] || user?.primary_blog;
}
