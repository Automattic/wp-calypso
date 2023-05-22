import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import type {
	APIError,
	ValidateVerificationCodeParams,
} from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';

interface APIResponse {
	success: boolean;
}

function mutationValidateVerificationCode(
	params: ValidateVerificationCodeParams
): Promise< APIResponse > {
	return wpcom.req.post( {
		apiNamespace: 'wpcom/v2',
		path: 'jetpack-agency/contacts/verify',
		body: params,
	} );
}

export default function useValidateVerificationCodeMutation< TContext = unknown >(
	options?: UseMutationOptions< APIResponse, APIError, ValidateVerificationCodeParams, TContext >
): UseMutationResult< APIResponse, APIError, ValidateVerificationCodeParams, TContext > {
	return useMutation< APIResponse, APIError, ValidateVerificationCodeParams, TContext >(
		mutationValidateVerificationCode,
		options
	);
}
