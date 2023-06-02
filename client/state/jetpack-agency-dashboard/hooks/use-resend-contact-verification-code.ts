import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import type {
	APIError,
	ResendVerificationCodeParams,
} from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';

interface APIResponse {
	success: boolean;
}

function mutationResendVerificationCode(
	params: ResendVerificationCodeParams
): Promise< APIResponse > {
	return wpcom.req.post( {
		apiNamespace: 'wpcom/v2',
		path: 'jetpack-agency/contacts/resend-verification',
		body: params,
	} );
}

export default function useResendVerificationCodeMutation< TContext = unknown >(
	options?: UseMutationOptions< APIResponse, APIError, ResendVerificationCodeParams, TContext >
): UseMutationResult< APIResponse, APIError, ResendVerificationCodeParams, TContext > {
	return useMutation< APIResponse, APIError, ResendVerificationCodeParams, TContext >(
		mutationResendVerificationCode,
		options
	);
}
