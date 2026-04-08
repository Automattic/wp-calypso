import {
	queryClient,
	rawUserPreferencesQuery,
	userPreferenceOptimisticMutation,
} from '@automattic/api-queries';
import { MutationObserver } from '@tanstack/react-query';
import type { User } from '@automattic/api-core';

/**
 * Returns the current site ID to be displayed in the omnibar,
 * based on the user's recent sites and primary blog.
 */
export function getCurrentOmnibarSiteId( user: User, recentSites?: number[] ) {
	return recentSites?.[ 0 ] || user.primary_blog;
}

/**
 * Sets the current site to be displayed in the omnibar,
 * by pushing the site to the front of the user's recent sites preferences.
 */
export async function setCurrentOmnibarSiteId( siteId: number ) {
	const prefs = await queryClient.ensureQueryData( rawUserPreferencesQuery() );
	const recentSites = prefs?.recentSites ?? [];
	if ( siteId === recentSites[ 0 ] ) {
		return;
	}
	const updated = [ ...new Set( [ siteId, ...recentSites ] ) ].slice( 0, 5 );
	new MutationObserver( queryClient, userPreferenceOptimisticMutation( 'recentSites' ) ).mutate(
		updated
	);
}
