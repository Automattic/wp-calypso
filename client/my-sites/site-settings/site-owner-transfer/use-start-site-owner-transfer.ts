import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { useCallback } from 'react';
import wp from 'calypso/lib/wp';

interface MutationVariables {
	newSiteOwner: string;
	keepAdminAccess: boolean;
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
		mutationFn: async ( { newSiteOwner, keepAdminAccess }: MutationVariables ) => {
			return wp.req.post(
				{
					path: `/sites/${ siteId }/site-owner-transfer`,
					apiNamespace: 'wpcom/v2',
				},
				{ new_site_owner: newSiteOwner, keep_admin_access: keepAdminAccess }
			);
		},
		...options,
	} );

	const { mutate, isLoading } = mutation;

	const startSiteOwnerTransfer = useCallback(
		( args: MutationVariables ) => mutate( args ),
		[ mutate ]
	);

	return { startSiteOwnerTransfer, isLoading };
};
