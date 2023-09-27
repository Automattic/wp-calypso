import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { wpcomJetpackLicensing as wpcomJpl } from 'calypso/lib/wp';
import type { APIError } from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';

interface APIResponse {
	success: boolean;
}

interface RequestBoostScoreParams {
	site_ids: number[];
}

function mutationRequestBoostScore( params: RequestBoostScoreParams ): Promise< APIResponse > {
	return wpcomJpl.req.post( {
		apiNamespace: 'wpcom/v2',
		path: '/jetpack-agency/sites/boost-scores',
		body: params,
	} );
}

export default function useRequestBoostScore< TContext = unknown >(
	options?: UseMutationOptions< APIResponse, APIError, RequestBoostScoreParams, TContext >
): UseMutationResult< APIResponse, APIError, RequestBoostScoreParams, TContext > {
	return useMutation< APIResponse, APIError, RequestBoostScoreParams, TContext >( {
		...options,
		mutationFn: mutationRequestBoostScore,
	} );
}
