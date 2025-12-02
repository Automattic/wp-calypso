import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import wpcom, { wpcomJetpackLicensing as wpcomJpl } from 'calypso/lib/wp';
import type {
	APIError,
	ValidateVerificationCodeParams,
} from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';

const client = isA8CForAgencies() ? wpcom : wpcomJpl;

interface APIResponse {
	verified: boolean;
	email_address: string;
}

function mutationValidateVerificationCode(
	params: ValidateVerificationCodeParams
): Promise< APIResponse > {
	return client.req.post( {
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
