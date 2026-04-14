import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { APIError } from 'calypso/state/partner-portal/types';

interface RequestAnotherReviewMutationOptions {
	siteId: number;
	reason: string;
}

function mutationRequestAnotherReview( {
	agencyId,
	siteId,
	reason,
}: RequestAnotherReviewMutationOptions & { agencyId: number | undefined } ): Promise< void > {
	if ( ! agencyId ) {
		throw new Error( 'Agency ID is required to request another review' );
	}

	return wpcom.req.post( {
		apiNamespace: 'wpcom/v2',
		path: `/agency/${ agencyId }/sites/${ siteId }/request-migration-reverification`,
		body: {
			reason,
		},
	} );
}

export default function useRequestAnotherReviewMutation< TContext = unknown >(
	options?: UseMutationOptions< void, APIError, RequestAnotherReviewMutationOptions, TContext >
): UseMutationResult< void, APIError, RequestAnotherReviewMutationOptions, TContext > {
	const agencyId = useSelector( getActiveAgencyId );

	return useMutation< void, APIError, RequestAnotherReviewMutationOptions, TContext >( {
		...options,
		mutationFn: ( args ) => mutationRequestAnotherReview( { ...args, agencyId } ),
	} );
}
