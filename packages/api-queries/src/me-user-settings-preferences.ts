import { fetchUserSettingsPreferences, updateUserSettingsPreferences } from '@automattic/api-core';
import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';

export const userSettingsPreferencesQuery = () =>
	queryOptions( {
		queryKey: [ 'me', 'user-settings-preferences' ],
		queryFn: fetchUserSettingsPreferences,
		meta: { persist: false },
	} );

export const userSettingsPreferencesMutation = () =>
	mutationOptions( {
		mutationFn: updateUserSettingsPreferences,
		onSuccess: ( newData ) => {
			queryClient.setQueryData( userSettingsPreferencesQuery().queryKey, ( oldData ) => ( {
				...oldData,
				...newData,
			} ) );
		},
	} );
