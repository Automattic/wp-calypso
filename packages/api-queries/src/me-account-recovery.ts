import {
	fetchAccountRecovery,
	updateAccountRecoveryEmail,
	removeAccountRecoveryEmail,
	resendAccountRecoveryEmailValidation,
} from '@automattic/api-core';
import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';

export const accountRecoveryQuery = () =>
	queryOptions( {
		queryKey: [ 'me', 'account-recovery' ],
		queryFn: fetchAccountRecovery,
	} );

export const updateAccountRecoveryEmailMutation = () =>
	mutationOptions( {
		mutationFn: updateAccountRecoveryEmail,
		onSuccess: ( _, email ) => {
			queryClient.setQueryData(
				accountRecoveryQuery().queryKey,
				( oldData ) => oldData && { ...oldData, email, email_validated: false }
			);
		},
	} );

export const removeAccountRecoveryEmailMutation = () =>
	mutationOptions( {
		mutationFn: removeAccountRecoveryEmail,
		onSuccess: () => {
			queryClient.setQueryData(
				accountRecoveryQuery().queryKey,
				( oldData ) => oldData && { ...oldData, email: '', email_validated: false }
			);
		},
	} );

export const resendAccountRecoveryEmailValidationMutation = () =>
	mutationOptions( {
		mutationFn: resendAccountRecoveryEmailValidation,
	} );
