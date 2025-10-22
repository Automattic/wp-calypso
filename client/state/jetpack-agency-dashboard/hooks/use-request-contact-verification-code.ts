import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import wpcom, { wpcomJetpackLicensing as wpcomJpl } from 'calypso/lib/wp';
import type {
	APIError,
	RequestVerificationCodeParams,
} from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';

const client = isA8CForAgencies() ? wpcom : wpcomJpl;

interface APIResponse {
	success: boolean;
}

function mutationRequestVerificationCode(
	params: RequestVerificationCodeParams
): Promise< APIResponse > {
	return client.req.post( {
		apiNamespace: 'wpcom/v2',
		path: '/jetpack-agency/contacts',
		body: params,
	} );
}

export default function useRequestContactVerificationCode< TContext = unknown >(
	options?: UseMutationOptions< APIResponse, APIError, RequestVerificationCodeParams, TContext >
): UseMutationResult< APIResponse, APIError, RequestVerificationCodeParams, TContext > {
	return useMutation< APIResponse, APIError, RequestVerificationCodeParams, TContext >( {
		...options,
		mutationFn: mutationRequestVerificationCode,
	} );
}
