import { closeAccount, restoreAccount } from '@automattic/api-core';
import { mutationOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';

export const closeAccountMutation = () =>
	mutationOptions( {
		meta: { statId: 'account-close' },
		// Closing the account ends the session, so there is no cache worth updating:
		// the caller has to leave the app.
		mutationFn: closeAccount,
	} );

export const restoreAccountMutation = () =>
	mutationOptions( {
		meta: { statId: 'account-restore' },
		mutationFn: ( token: string ) => restoreAccount( token ),
		onSuccess: () => {
			// Invalidate all queries to refresh data after account restoration
			queryClient.invalidateQueries();
		},
	} );
