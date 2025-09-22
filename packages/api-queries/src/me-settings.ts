import { fetchUserSettings, updateUserSettings, submitUsernameChange } from '@automattic/api-core';
import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';

export const userSettingsQuery = () =>
	queryOptions( {
		queryKey: [ 'me', 'settings' ],
		queryFn: fetchUserSettings,
	} );

export const userSettingsMutation = () =>
	mutationOptions( {
		mutationFn: updateUserSettings,
		onSuccess: ( newData ) => {
			queryClient.setQueryData(
				userSettingsQuery().queryKey,
				( oldData ) =>
					oldData && {
						...oldData,
						...newData,
					}
			);
		},
	} );

export const usernameChangeMutation = () =>
	mutationOptions( {
		mutationFn: ( { username, action }: { username: string; action: string } ) =>
			submitUsernameChange( username, action ),
		onSuccess: () => {
			// Invalidate user settings to refetch updated data
			queryClient.invalidateQueries( { queryKey: [ 'me', 'settings' ] } );
		},
	} );
