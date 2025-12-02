import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import wpcom, { wpcomJetpackLicensing as wpcomJpl } from 'calypso/lib/wp';
import type {
	APIError,
	ResendVerificationCodeParams,
} from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';

interface APIResponse {
	success: boolean;
}

const client = isA8CForAgencies() ? wpcom : wpcomJpl;

function mutationResendVerificationCode(
	params: ResendVerificationCodeParams
): Promise< APIResponse > {
	return client.req.post( {
		apiNamespace: 'wpcom/v2',
		path: '/jetpack-agency/contacts/resend-verification',
		body: params,
	} );
}

export default function useResendVerificationCodeMutation< TContext = unknown >(
	options?: UseMutationOptions< APIResponse, APIError, ResendVerificationCodeParams, TContext >
): UseMutationResult< APIResponse, APIError, ResendVerificationCodeParams, TContext > {
	return useMutation< APIResponse, APIError, ResendVerificationCodeParams, TContext >( {
		...options,
		mutationFn: mutationResendVerificationCode,
	} );
}
