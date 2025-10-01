import {
	fetchUserSettings,
	updateUserSettings,
	cancelPendingEmailChange,
	resendEmailVerification,
} from '@automattic/api-core';
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

export const cancelPendingEmailChangeMutation = () =>
	mutationOptions( {
		mutationFn: cancelPendingEmailChange,
		onSuccess: ( newData ) => {
			queryClient.setQueryData(
				userSettingsQuery().queryKey,
				( oldData ) =>
					oldData && {
						...oldData,
						...newData,
					}
			);
			queryClient.invalidateQueries( userSettingsQuery() );
		},
	} );

export const resendEmailVerificationMutation = () =>
	mutationOptions( {
		mutationFn: resendEmailVerification,
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
