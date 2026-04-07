import {
	queryClient,
	rawUserPreferencesQuery,
	userPreferenceOptimisticMutation,
} from '@automattic/api-queries';
import { MutationObserver } from '@tanstack/react-query';

/**
 * Sets the current site to be displayed in the omnibar,
 * by pushing the site ID to the front of the recentSites user preferences.
 */
export async function setCurrentOmnibarSite( siteId: number ) {
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
