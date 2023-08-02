import { UseMutationOptions, useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import wpcom from 'calypso/lib/wp';

/**
 * Return a mutation function that will confirm the transfer of a site to another user.
 *
 */
export function useConfirmTransfer(
	{ siteId }: { siteId: number },
	queryOptions: UseMutationOptions< unknown, unknown, string > = {}
) {
	const mutation = useMutation( {
		mutationFn: ( confirmationHash ) =>
			wpcom.req.post(
				{ path: `/sites/${ siteId }/site-owner-transfer/confirm`, apiNamespace: 'wpcom/v2' },
				{
					hash: confirmationHash,
				}
			),
		...queryOptions,
	} );
	const { mutate } = mutation;

	/**
	 * Mutation to confirm the transfer of a site to another user given a confirmation hash.
	 */
	const confirmTransfer = useCallback(
		( confirmationHash: string ) => {
			mutate( confirmationHash );
		},
		[ mutate ]
	);

	return { confirmTransfer, ...mutation };
}
