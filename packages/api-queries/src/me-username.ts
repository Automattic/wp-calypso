import { updateUsername } from '@automattic/api-core';
import { mutationOptions } from '@tanstack/react-query';
import { userSettingsQuery } from './me-settings';
import { queryClient } from './query-client';

export const updateUsernameMutation = () =>
	mutationOptions( {
		mutationFn: ( { username, action }: { username: string; action: string } ) =>
			updateUsername( username, action ),
		onSuccess: () => {
			// Invalidate user settings to refetch updated data
			queryClient.invalidateQueries( userSettingsQuery() );
		},
	} );
