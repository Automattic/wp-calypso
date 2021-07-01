/**
 * External dependencies
 */
import { useCallback } from 'react';
import { useMutation, useQueryClient } from 'react-query';

/**
 * Internal dependencies
 */
import { queryKeyPrefix } from './use-emails-query';
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
	mutationOptions = mutationOptions ?? {};

	const suppliedOnSettled = mutationOptions.onSettled ?? noop;

	const queryClient = useQueryClient();

	mutationOptions.onSettled = ( data, error, variables, context ) => {
		suppliedOnSettled?.( data, error, variables, context );

		queryClient.invalidateQueries( {
			predicate: ( { queryKey: [ prefix, , domain ] = [] } ) =>
				prefix === queryKeyPrefix && domain === domainName,
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

	const removeTitanMailbox = useCallback( () => {
		mutate( {} );
	}, [ mutate ] );

	return { removeTitanMailbox, ...mutation };
}
