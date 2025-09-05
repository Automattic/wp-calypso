import {
	userSettingsQuery,
	userSettingsMutation,
	userPreferenceQuery,
	userPreferenceMutation,
} from '@automattic/api-queries';
import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';

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

	// Fetch preferences for landing page settings
	const sitesLandingResult = useQuery( userPreferenceQuery( SITES_AS_LANDING_PAGE_PREFERENCE ) );
	const readerLandingResult = useQuery( userPreferenceQuery( READER_AS_LANDING_PAGE_PREFERENCE ) );

	const data: LoginPreferencesData = {
		primarySiteId: userSettingsResult.data.primary_site_ID?.toString(),
		defaultLandingPage: getDefaultLandingPage( sitesLandingResult.data, readerLandingResult.data ),
	};

	const isLoading = sitesLandingResult.isLoading || readerLandingResult.isLoading;

	return {
		data,
		isLoading,
		error: userSettingsResult.error || sitesLandingResult.error || readerLandingResult.error,
	};
}

export function useUpdateLoginPreferences() {
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

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

			promises.push(
				sitesLandingUpdate.mutateAsync( {
					useSitesAsLandingPage: data.defaultLandingPage === 'sites',
					updatedAt,
				} )
			);

			promises.push(
				readerLandingUpdate.mutateAsync( {
					useReaderAsLandingPage: data.defaultLandingPage === 'reader',
					updatedAt,
				} )
			);

			await Promise.all( promises );
		},
		onSuccess: () => {
			createSuccessNotice( __( 'Login preferences saved successfully.' ), { type: 'snackbar' } );
		},
		onError: () => {
			createErrorNotice( __( 'Failed to save login preferences. Please try again.' ), {
				type: 'snackbar',
			} );
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
