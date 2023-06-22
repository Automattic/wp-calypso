import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { wpcomJetpackLicensing as wpcomJpl } from 'calypso/lib/wp';
import type {
	APIError,
	ValidateVerificationCodeParams,
} from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';

interface APIResponse {
	verified: boolean;
	email_address: string;
}

function mutationValidateVerificationCode(
	params: ValidateVerificationCodeParams
): Promise< APIResponse > {
	return wpcomJpl.req.post( {
		apiNamespace: 'wpcom/v2',
		path: '/jetpack-agency/contacts/verify',
		body: params,
	} );
}

export default function useValidateVerificationCodeMutation< TContext = unknown >(
	options?: UseMutationOptions< APIResponse, APIError, ValidateVerificationCodeParams, TContext >
): UseMutationResult< APIResponse, APIError, ValidateVerificationCodeParams, TContext > {
	return useMutation< APIResponse, APIError, ValidateVerificationCodeParams, TContext >( {
		...options,
		mutationFn: mutationValidateVerificationCode,
	} );
}
