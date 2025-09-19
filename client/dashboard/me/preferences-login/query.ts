import { userSettingsQuery, userLoginPreferencesQuery, sitesQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';

export function useLoginPreferences() {
	// Fetch user settings for primary_site_ID
	const userSettingsResult = useSuspenseQuery( userSettingsQuery() );
	const userPreferences = useSuspenseQuery( userLoginPreferencesQuery() );

	// Fetch user's sites
	const sitesResult = useSuspenseQuery(
		sitesQuery( { site_visibility: 'visible', include_a8c_owned: false } )
	);

	// Validate primary_site_ID exists in user's current sites
	const rawPrimarySiteId = userSettingsResult.data?.primary_site_ID;
	const sites = sitesResult.data || [];
	const isValidPrimarySite = rawPrimarySiteId
		? sites.some( ( site ) => site.ID === rawPrimarySiteId )
		: false;

	const data = {
		primarySiteId: isValidPrimarySite && rawPrimarySiteId ? rawPrimarySiteId.toString() : undefined,
		defaultLandingPage: userPreferences.data.defaultLandingPage,
	};

	const isLoading =
		userSettingsResult.isLoading || sitesResult.isLoading || userPreferences.isLoading;
	return {
		data,
		sites,
		isLoading,
		error: userSettingsResult.error || sitesResult.error || userPreferences.error,
	};
}
