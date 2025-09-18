import {
	userSettingsQuery,
	userSettingsMutation,
	userPreferenceQuery,
	userPreferenceMutation,
	sitesQuery,
} from '@automattic/api-queries';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';

export type LandingPage = 'primary-site-dashboard' | 'sites' | 'reader';

export interface LoginPreferencesData {
	primarySiteId?: string;
	defaultLandingPage: LandingPage;
}

const SITES_AS_LANDING_PAGE_PREFERENCE = 'sites-landing-page';
const READER_AS_LANDING_PAGE_PREFERENCE = 'reader-landing-page';

export function useLoginPreferences() {
	// Fetch user settings for primary_site_ID
	const userSettingsResult = useSuspenseQuery( userSettingsQuery() );

	// Fetch user's sites
	const sitesResult = useSuspenseQuery(
		sitesQuery( { site_visibility: 'visible', include_a8c_owned: false } )
	);

	// Fetch preferences for landing page settings
	const sitesLandingResult = useSuspenseQuery(
		userPreferenceQuery( SITES_AS_LANDING_PAGE_PREFERENCE )
	);
	const readerLandingResult = useSuspenseQuery(
		userPreferenceQuery( READER_AS_LANDING_PAGE_PREFERENCE )
	);

	// Validate primary_site_ID exists in user's current sites
	const rawPrimarySiteId = userSettingsResult.data?.primary_site_ID;
	const sites = sitesResult.data || [];
	const isValidPrimarySite = rawPrimarySiteId
		? sites.some( ( site ) => site.ID === rawPrimarySiteId )
		: false;

	const data: LoginPreferencesData = {
		primarySiteId: isValidPrimarySite && rawPrimarySiteId ? rawPrimarySiteId.toString() : undefined,
		defaultLandingPage: getDefaultLandingPage( sitesLandingResult.data, readerLandingResult.data ),
	};

	const isLoading =
		userSettingsResult.isLoading ||
		sitesResult.isLoading ||
		sitesLandingResult.isLoading ||
		readerLandingResult.isLoading;

	return {
		data,
		sites,
		isLoading,
		error:
			userSettingsResult.error ||
			sitesResult.error ||
			sitesLandingResult.error ||
			readerLandingResult.error,
	};
}

export function useUpdateLoginPreferences() {
	const userSettingsUpdate = useMutation( userSettingsMutation() );
	const sitesLandingUpdate = useMutation(
		userPreferenceMutation( SITES_AS_LANDING_PAGE_PREFERENCE )
	);
	const readerLandingUpdate = useMutation(
		userPreferenceMutation( READER_AS_LANDING_PAGE_PREFERENCE )
	);

	return useMutation( {
		mutationFn: async ( data: LoginPreferencesData ) => {
			const promises = [];

			// Update primary site if changed
			if ( data.primarySiteId ) {
				promises.push(
					userSettingsUpdate.mutateAsync( {
						primary_site_ID: parseInt( data.primarySiteId, 10 ),
					} )
				);
			}

			// Update landing page preferences
			const updatedAt = Date.now();

			// the following calls the same api - must be called sequentially
			await sitesLandingUpdate.mutateAsync( {
				useSitesAsLandingPage: data.defaultLandingPage === 'sites',
				updatedAt,
			} );
			await readerLandingUpdate.mutateAsync( {
				useReaderAsLandingPage: data.defaultLandingPage === 'reader',
				updatedAt,
			} );
			await Promise.all( promises );
		},
	} );
}

function getDefaultLandingPage(
	sitesLandingData: { useSitesAsLandingPage?: boolean } | undefined,
	readerLandingData: { useReaderAsLandingPage?: boolean } | undefined
): LandingPage {
	if ( sitesLandingData?.useSitesAsLandingPage ) {
		return 'sites';
	}
	if ( readerLandingData?.useReaderAsLandingPage ) {
		return 'reader';
	}
	return 'primary-site-dashboard';
}
