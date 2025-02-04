import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import type { SubmitJetpackStatsFeedbackParams } from './use-submit-product-feedback';
import type { APIError } from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';

interface APIResponse {
	success: boolean;
}

function mutationSubmitProductFeedback(
	params: SubmitJetpackStatsFeedbackParams,
	siteId?: number
): Promise< APIResponse > {
	return wpcom.req.post( {
		apiNamespace: 'wpcom/v2',
		path: `/sites/${ siteId }/jetpack-stats/user-feedback`,
		body: params,
	} );
}

export default function useSubmitProductFeedbackMutation< TContext = unknown >(
	siteId?: number,
	options?: UseMutationOptions< APIResponse, APIError, SubmitJetpackStatsFeedbackParams, TContext >
): UseMutationResult< APIResponse, APIError, SubmitJetpackStatsFeedbackParams, TContext > {
	return useMutation< APIResponse, APIError, SubmitJetpackStatsFeedbackParams, TContext >( {
		...options,
		mutationFn: ( params ) => mutationSubmitProductFeedback( params, siteId ),
	} );
}
