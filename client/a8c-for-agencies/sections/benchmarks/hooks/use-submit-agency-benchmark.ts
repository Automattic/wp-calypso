import {
	useMutation,
	useQueryClient,
	type UseMutationOptions,
	type UseMutationResult,
} from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { APIError } from 'calypso/state/partner-portal/types';
import { getFetchAgencyBenchmarkQueryKey } from './use-fetch-agency-benchmark';
import { getFetchAgencyBenchmarksListQueryKey } from './use-fetch-agency-benchmarks-list';
import { getFetchBenchmarksAggregatesQueryKey } from './use-fetch-benchmarks-aggregates';
import type { AgencyBenchmark, AgencyBenchmarkSubmission } from '../constants';

function postAgencyBenchmark(
	agencyId: number | undefined,
	payload: AgencyBenchmarkSubmission
): Promise< AgencyBenchmark > {
	if ( ! agencyId ) {
		throw new Error( 'Agency ID is required to submit a benchmark.' );
	}
	return wpcom.req.post( {
		apiNamespace: 'wpcom/v2',
		path: `/agency/${ agencyId }/benchmarks`,
		body: payload,
	} );
}

export default function useSubmitAgencyBenchmark< TContext = unknown >(
	options?: UseMutationOptions< AgencyBenchmark, APIError, AgencyBenchmarkSubmission, TContext >
): UseMutationResult< AgencyBenchmark, APIError, AgencyBenchmarkSubmission, TContext > {
	const agencyId = useSelector( getActiveAgencyId );
	const queryClient = useQueryClient();

	return useMutation< AgencyBenchmark, APIError, AgencyBenchmarkSubmission, TContext >( {
		...options,
		mutationFn: ( payload ) => postAgencyBenchmark( agencyId, payload ),
		onSuccess: ( data, variables, context ) => {
			queryClient.invalidateQueries( {
				queryKey: getFetchAgencyBenchmarkQueryKey(
					agencyId,
					variables.quarter as 1 | 2 | 3 | 4,
					variables.year
				),
			} );
			queryClient.invalidateQueries( {
				queryKey: getFetchAgencyBenchmarksListQueryKey( agencyId ),
			} );
			queryClient.invalidateQueries( {
				queryKey: getFetchBenchmarksAggregatesQueryKey( agencyId ),
			} );
			options?.onSuccess?.( data, variables, context );
		},
	} );
}
