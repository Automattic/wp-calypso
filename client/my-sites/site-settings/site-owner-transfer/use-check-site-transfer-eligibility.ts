import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { useCallback } from 'react';
import wp from 'calypso/lib/wp';

interface MutationVariables {
	newSiteOwner: string;
}

interface MutationResponse {
	message: string;
}

interface MutationError {
	code: string;
	message: string;
}

export const useCheckSiteTransferEligibility = (
	siteId: number | null,
	options: UseMutationOptions< MutationResponse, MutationError, MutationVariables > = {}
) => {
	const mutation = useMutation( {
		mutationFn: async ( { newSiteOwner }: MutationVariables ) =>
			wp.req.post(
				{
					path: `/sites/${ siteId }/site-owner-transfer/eligibility`,
					apiNamespace: 'wpcom/v2',
				},
				{ new_site_owner: newSiteOwner }
			),
		...options,
	} );

	const { mutate, isLoading } = mutation;

	const checkSiteTransferEligibility = useCallback(
		( args: MutationVariables ) => mutate( args ),
		[ mutate ]
	);

	return { checkSiteTransferEligibility, isLoading };
};
