import {
	fetchAccountRecovery,
	updateAccountRecoveryEmail,
	removeAccountRecoveryEmail,
	resendAccountRecoveryEmailValidation,
	updateAccountRecoverySMS,
	validateAccountRecoverySMSCode,
	removeAccountRecoverySMS,
	resendAccountRecoverySMSValidation,
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

type UpdateAccountRecoverySMSMutationParams = {
	countryCode: string;
	phoneNumber: string;
	countryNumericCode: string;
};

export const updateAccountRecoverySMSMutation = () =>
	mutationOptions( {
		mutationFn: ( { countryCode, phoneNumber }: UpdateAccountRecoverySMSMutationParams ) =>
			updateAccountRecoverySMS( countryCode, phoneNumber ),
		onSuccess: ( _, sms ) => {
			queryClient.setQueryData(
				accountRecoveryQuery().queryKey,
				( oldData ) =>
					oldData && {
						...oldData,
						phone: {
							country_code: sms.countryCode,
							country_numeric_code: sms.countryNumericCode,
							number: sms.phoneNumber,
							number_full: `${ sms.countryNumericCode }${ sms.phoneNumber }`,
						},
						phone_validated: false,
					}
			);
		},
	} );

export const removeAccountRecoverySMSMutation = () =>
	mutationOptions( {
		mutationFn: removeAccountRecoverySMS,
		onSuccess: () => {
			queryClient.setQueryData(
				accountRecoveryQuery().queryKey,
				( oldData ) => oldData && { ...oldData, phone: null, phone_validated: false }
			);
		},
	} );

export const resendAccountRecoverySMSValidationMutation = () =>
	mutationOptions( {
		mutationFn: resendAccountRecoverySMSValidation,
	} );

export const validateAccountRecoverySMSCodeMutation = () =>
	mutationOptions( {
		mutationFn: validateAccountRecoverySMSCode,
		onSuccess: () => {
			queryClient.setQueryData(
				accountRecoveryQuery().queryKey,
				( oldData ) => oldData && { ...oldData, phone_validated: true }
			);
		},
	} );
