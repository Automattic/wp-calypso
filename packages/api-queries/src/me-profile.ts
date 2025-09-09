import { fetchProfile, updateProfile } from '@automattic/api-core';
import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';

export const profileQuery = () =>
	queryOptions( {
		queryKey: [ 'me', 'profile' ],
		queryFn: fetchProfile,
	} );

export const profileMutation = () =>
	mutationOptions( {
		mutationFn: updateProfile,
		onSuccess: ( newData ) => {
			queryClient.setQueryData(
				profileQuery().queryKey,
				( oldData ) => oldData && { ...oldData, ...newData }
			);
		},
	} );
