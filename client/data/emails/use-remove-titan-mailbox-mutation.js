/**
 * External dependencies
 */
import { useCallback } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { getCacheKey } from './use-emails-query';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import wp from 'calypso/lib/wp';

const invalidationDelayTimeout = 5000;
const noop = () => {};

const getNumberOfMailboxes = ( queryClient, queryKey ) => {
	const data = queryClient.getQueryData( queryKey );
	return data?.accounts?.[ 0 ].emails?.length || 0;
};

/**
 * Deletes a mailbox from a Professional Email (Titan) account
 *
 * @param {string} domainName The domain name of the mailbox
 * @param {string} mailboxName The mailbox name
 * @param {object} mutationOptions Mutation options passed on to `useMutation`
 * @returns {{ data, error, isLoading: boolean, removeTitanMailbox: Function, ...}} Returns various parameters piped from `useMutation`
 */
export function useRemoveTitanMailboxMutation( domainName, mailboxName, mutationOptions = null ) {
	const queryClient = useQueryClient();

	const selectedSiteId = useSelector( getSelectedSiteId );

	const queryKey = getCacheKey( selectedSiteId, domainName );

	mutationOptions = mutationOptions ?? {};

	// Collect the supplied callback
	const suppliedOnSettled = mutationOptions.onSettled ?? noop;

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
			if ( numberOfMailboxes < context.previousNumberOfMailboxes ) {
				return;
			}

			setTimeout( () => {
				queryClient.invalidateQueries( queryKey );
			}, invalidationDelayTimeout );
		} );
	};

	const mutation = useMutation(
		() =>
			wp.req.get( {
				path: `/emails/titan/${ encodeURIComponent( domainName ) }/mailbox/${ encodeURIComponent(
					mailboxName
				) }`,
				method: 'DELETE',
				apiNamespace: 'wpcom/v2',
			} ),
		mutationOptions
	);

	const { mutate } = mutation;

	// Memoize the `mutate` method into a callback
	const removeTitanMailbox = useCallback( () => {
		mutate( {} );
	}, [ mutate ] );

	// Bundle the callback to make it easy for downstream clients to invoke it
	return { removeTitanMailbox, ...mutation };
}
