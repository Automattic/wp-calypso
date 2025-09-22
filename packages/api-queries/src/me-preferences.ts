import { fetchPreferences, updatePreferences } from '@automattic/api-core';
import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';
import type { UserPreferences } from '@automattic/api-core';

const defaultValues: Required< UserPreferences > = {
	'hosting-dashboard-opt-in': { value: 'unset', updated_at: '' },
	'hosting-dashboard-welcome-notice-dismissed': '',
	'reader-landing-page': {
		useReaderAsLandingPage: false,
		updatedAt: 0,
	},
	'sites-landing-page': {
		useSitesAsLandingPage: false,
		updatedAt: 0,
	},
	'sites-view': {},
};

// Returns all user preferences, without applying any defaults.
export const rawUserPreferencesQuery = () =>
	queryOptions( {
		queryKey: [ 'me', 'preferences' ],
		queryFn: fetchPreferences,
	} );

export const userPreferenceQuery = < P extends keyof UserPreferences >( preferenceName: P ) =>
	queryOptions( {
		queryKey: rawUserPreferencesQuery().queryKey,
		queryFn: fetchPreferences,
		select: ( data ): Required< UserPreferences >[ P ] => {
			const fetchedValue = data[ preferenceName ];
			return fetchedValue === undefined
				? defaultValues[ preferenceName ]
				: // `fetchedValue` is a `NonNullable< UserPreferences[ P ] >`, which we know is the same
				  // as `Required< UserPreferences >[ P ]`, but the later gives better type hints when
				  // the query is used in the component.
				  ( fetchedValue as Required< UserPreferences >[ P ] );
		},
	} );

export const userPreferenceMutation = < P extends keyof UserPreferences >( preferenceName: P ) =>
	mutationOptions( {
		mutationFn: ( data: Required< UserPreferences >[ P ] ) =>
			updatePreferences( {
				[ preferenceName ]: data,
			} as Partial< UserPreferences > ),
		onSuccess: ( newData ) => {
			queryClient.setQueryData( rawUserPreferencesQuery().queryKey, ( oldData ) =>
				oldData ? { ...oldData, ...newData } : newData
			);
		},
	} );
