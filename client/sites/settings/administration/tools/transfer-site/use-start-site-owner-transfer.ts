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

export const useStartSiteOwnerTransfer = (
	siteId: number | null,
	options: UseMutationOptions< MutationResponse, MutationError, MutationVariables > = {}
) => {
	const mutation = useMutation( {
		...options,
		mutationFn: async ( { newSiteOwner }: MutationVariables ) => {
			return wp.req.post(
				{
					path: `/sites/${ siteId }/site-owner-transfer`,
					apiNamespace: 'wpcom/v2',
				},
				{ new_site_owner: newSiteOwner }
			);
		},
	} );

	const { mutate, isPending } = mutation;

	const startSiteOwnerTransfer = useCallback(
		( args: MutationVariables ) => mutate( args ),
		[ mutate ]
	);

	return { startSiteOwnerTransfer, isPending };
};
