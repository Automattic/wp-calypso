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

const noop = () => {};

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

	// Setup optimistic updates before the mutation by excluding the mailbox we intend to delete from the cached query data.
	// This can provide for a good UX.
	mutationOptions.onMutate = async () => {
		await queryClient.cancelQueries( queryKey );

		const previousData = queryClient.getQueryData( queryKey );

		queryClient.setQueryData( queryKey, ( data ) => {
			if ( data?.accounts?.[ 0 ].emails?.length > 0 ) {
				data.accounts[ 0 ].emails = data.accounts[ 0 ].emails.filter(
					( mailbox ) => mailbox.mailbox !== mailboxName
				);
			}
			return data;
		} );

		// Snapshot the query data before the mutation. This snapshot is provided in context to the status callbacks
		return { previousData };
	};

	// This is called for both success and error statuses.
	// Invoke any supplied `onSettled` callbacks here. This is so we can do things like invalidate queries and
	// rollback optimistic updates if the mutation fails
	mutationOptions.onSettled = ( data, error, variables, context ) => {
		suppliedOnSettled?.( data, error, variables, context );

		// Always invalidate attendant queries
		queryClient.invalidateQueries( queryKey );

		if ( error ) {
			// If the mutation failed to succeed, "rollback" the optimistic update
			queryClient.setQueryData( queryKey, context.previousData );
		}
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
