import {
	updatePreferences,
	updateUserSettings,
	fetchPreferences,
	UserPreferences,
} from '@automattic/api-core';
import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';
import { userSettingsQuery } from './';

export type UserLoginPreferencesMutationProps = {
	primarySiteId: string | undefined;
	defaultLandingPage: 'primary-site-dashboard' | 'sites' | 'reader';
};

export const userLoginPreferencesQuery = () =>
	queryOptions( {
		queryKey: [ 'me', 'preferences', 'login' ],
		queryFn: fetchPreferences,
		select: ( data ): Pick< UserLoginPreferencesMutationProps, 'defaultLandingPage' > => {
			return {
				defaultLandingPage: getDefaultLandingPage( data ),
			};
		},
	} );

export const userLoginPreferencesMutation = () =>
	mutationOptions( {
		mutationFn: async ( data: Required< UserLoginPreferencesMutationProps > ) => {
			if ( data.primarySiteId ) {
				await updateUserSettings( {
					primary_site_ID: parseInt( data.primarySiteId, 10 ),
				} );
			}
			const updatedAt = Date.now();

			await updatePreferences( {
				'sites-landing-page': {
					useSitesAsLandingPage: 'sites' === data.defaultLandingPage,
					updatedAt,
				},
				'reader-landing-page': {
					useReaderAsLandingPage: 'reader' === data.defaultLandingPage,
					updatedAt,
				},
			} );
		},
		onSuccess: () => {
			queryClient.invalidateQueries( userSettingsQuery() );
			queryClient.invalidateQueries( userLoginPreferencesQuery() );
		},
	} );

function getDefaultLandingPage(
	preferences: UserPreferences
): UserLoginPreferencesMutationProps[ 'defaultLandingPage' ] {
	if ( preferences[ 'sites-landing-page' ]?.useSitesAsLandingPage ) {
		return 'sites';
	}
	if ( preferences[ 'reader-landing-page' ]?.useReaderAsLandingPage ) {
		return 'reader';
	}
	return 'primary-site-dashboard';
}
