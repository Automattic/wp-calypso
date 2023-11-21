import { useMutation, useQueryClient } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getCacheKey } from './use-get-email-accounts-query';
import type {
	QueryClient,
	QueryKey,
	UseMutationOptions,
	UseMutationResult,
} from '@tanstack/react-query';

const invalidationDelayTimeout = 5000;

const getNumberOfMailboxes = ( queryClient: QueryClient, queryKey: QueryKey ) => {
	const data = queryClient.getQueryData< any >( queryKey );
	return data?.accounts?.[ 0 ].emails?.length || 0;
};

type MutationContext = {
	previousNumberOfMailboxes: number;
};

/**
 * Deletes a mailbox from a Professional Email (Titan) account
 * @param domainName The domain name of the mailbox
 * @param mailboxName The mailbox name
 * @param mutationOptions Mutation options passed on to `useMutation`
 * @returns Returns the result of the `useMutation` call
 */
export function useRemoveTitanMailboxMutation(
	domainName: string,
	mailboxName: string,
	mutationOptions: Omit<
		UseMutationOptions< unknown, unknown, void, MutationContext >,
		'mutationFn'
	> = {}
): UseMutationResult< unknown, unknown, void, unknown > {
	const queryClient = useQueryClient();

	const selectedSiteId = useSelector( getSelectedSiteId );

	const queryKey = getCacheKey( selectedSiteId, domainName );

	// Collect the supplied callback
	const suppliedOnSettled = mutationOptions.onSettled;

	// Setup actions to happen before the mutation
	mutationOptions.onMutate = async () => {
		await queryClient.cancelQueries( queryKey );

		const previousNumberOfMailboxes = getNumberOfMailboxes( queryClient, queryKey );

		// Snapshot the number of mailboxes before the mutation. This snapshot is provided in context to the status callbacks
		return { previousNumberOfMailboxes };
	};

	// This is called for both success and error statuses.
	// Invoke any supplied `onSettled` callbacks here. This is so we can do things like invalidate queries etc
	mutationOptions.onSettled = ( data, error, variables, context ) => {
		suppliedOnSettled?.( data, error, variables, context );

		// Always invalidate attendant queries
		queryClient.invalidateQueries( queryKey ).then( () => {
			const numberOfMailboxes = getNumberOfMailboxes( queryClient, queryKey );

			// Determine if we already have updated data, since the removal job is not synchronous
			if ( context && numberOfMailboxes < context.previousNumberOfMailboxes ) {
				return;
			}

			setTimeout( () => {
				queryClient.invalidateQueries( queryKey );
			}, invalidationDelayTimeout );
		} );
	};

	return useMutation( {
		mutationFn: () =>
			wp.req.get( {
				path: `/emails/titan/${ encodeURIComponent( domainName ) }/mailbox/${ encodeURIComponent(
					mailboxName
				) }`,
				method: 'DELETE',
				apiNamespace: 'wpcom/v2',
			} ),
		...mutationOptions,
	} );
}
