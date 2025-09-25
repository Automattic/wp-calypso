import { submitUsernameChange } from '@automattic/api-core';
import { mutationOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';

export const usernameChangeMutation = () =>
	mutationOptions( {
		mutationFn: ( { username, action }: { username: string; action: string } ) =>
			submitUsernameChange( username, action ),
		onSuccess: () => {
			// Invalidate user settings to refetch updated data
			queryClient.invalidateQueries( { queryKey: [ 'me', 'settings' ] } );
		},
	} );
