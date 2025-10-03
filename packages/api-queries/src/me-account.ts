import { closeAccount, restoreAccount } from '@automattic/api-core';
import { mutationOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';

export const closeAccountMutation = () =>
	mutationOptions( {
		mutationFn: closeAccount,
		onSuccess: () => {
			// Clear all cached data when account is closed
			queryClient.clear();
		},
	} );

export const restoreAccountMutation = () =>
	mutationOptions( {
		mutationFn: ( token: string ) => restoreAccount( token ),
		onSuccess: () => {
			// Invalidate all queries to refresh data after account restoration
			queryClient.invalidateQueries();
		},
	} );
