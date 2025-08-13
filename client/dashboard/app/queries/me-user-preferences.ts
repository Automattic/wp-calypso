import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { fetchUserPreferences, updateUserPreferences } from '../../data/me-user-preferences';
import { queryClient } from '../query-client';

export const userPreferencesQuery = () =>
	queryOptions( {
		queryKey: [ 'me', 'user-preferences' ],
		queryFn: fetchUserPreferences,
	} );

export const userPreferencesMutation = () =>
	mutationOptions( {
		mutationFn: updateUserPreferences,
		onSuccess: ( newData ) => {
			queryClient.setQueryData(
				userPreferencesQuery().queryKey,
				( oldData ) => oldData && { ...oldData, ...newData }
			);
		},
	} );
