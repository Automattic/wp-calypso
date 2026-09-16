import {
	fetchReadFourForFourCandidates,
	fetchReadFourForFourStatus,
	recordReadFourForFourProgress,
} from '@automattic/api-core';
import { mutationOptions, queryOptions, type QueryClient } from '@tanstack/react-query';
import type {
	ReadFourForFourCandidatesResponse,
	ReadFourForFourProgressParams,
	ReadFourForFourStatusResponse,
} from '@automattic/api-core';

const FIVE_MINUTES_MS = 5 * 60 * 1000;

export const getReadFourForFourCandidatesQueryKey = () =>
	[ 'read', 'four-for-four', 'candidates' ] as const;

export const getReadFourForFourStatusQueryKey = () =>
	[ 'read', 'four-for-four', 'status' ] as const;

export const readFourForFourCandidatesQuery = () =>
	queryOptions( {
		queryKey: getReadFourForFourCandidatesQueryKey(),
		queryFn: fetchReadFourForFourCandidates,
		select: ( data: ReadFourForFourCandidatesResponse ) => data.candidates ?? [],
		staleTime: FIVE_MINUTES_MS,
		meta: { persist: false },
		refetchOnWindowFocus: false,
	} );

export const readFourForFourStatusQuery = () =>
	queryOptions( {
		queryKey: getReadFourForFourStatusQueryKey(),
		queryFn: fetchReadFourForFourStatus,
		staleTime: FIVE_MINUTES_MS,
		meta: { persist: false },
	} );

export const recordReadFourForFourProgressMutation = ( queryClient: QueryClient ) =>
	mutationOptions< ReadFourForFourStatusResponse, Error, ReadFourForFourProgressParams >( {
		mutationFn: recordReadFourForFourProgress,
		onSuccess: ( status ) => {
			queryClient.setQueryData( getReadFourForFourStatusQueryKey(), status );
		},
	} );
