import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { wpcomJetpackLicensing as wpcomJpl } from 'calypso/lib/wp';
import type {
	APIError,
	SubmitProductFeedbackParams,
} from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';

interface APIResponse {
	success: boolean;
}

function mutationSubmitProductFeedback(
	params: SubmitProductFeedbackParams
): Promise< APIResponse > {
	return wpcomJpl.req.post( {
		apiNamespace: 'wpcom/v2',
		path: '/jetpack-manage/user-feedback',
		body: params,
	} );
}

export default function useSubmitProductFeedbackMutation< TContext = unknown >(
	options?: UseMutationOptions< APIResponse, APIError, SubmitProductFeedbackParams, TContext >
): UseMutationResult< APIResponse, APIError, SubmitProductFeedbackParams, TContext > {
	return useMutation< APIResponse, APIError, SubmitProductFeedbackParams, TContext >( {
		...options,
		mutationFn: mutationSubmitProductFeedback,
	} );
}
