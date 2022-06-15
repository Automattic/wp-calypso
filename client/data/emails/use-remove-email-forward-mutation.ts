import { useMutation, useQueryClient } from 'react-query';
import { useSelector } from 'react-redux';
import { getCacheKey as getEmailDomainsQueryKey } from 'calypso/data/domains/use-get-domains-query';
import wp from 'calypso/lib/wp';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getCacheKey as getEmailAccountsQueryKey } from './use-get-email-accounts-query';
import type { UseMutationOptions, UseMutationResult } from 'react-query';

/**
 * Deletes an email forward
 *
 * @param domainName The domain name of the mailbox
 * @param mailboxName The mailbox name
 * @param mutationOptions Mutation options passed on to `useMutation`
 * @returns Returns the result of the `useMutation` call
 */
export function useRemoveEmailForwardMutation(
	domainName: string,
	mailboxName: string,
	mutationOptions: UseMutationOptions = {}
): UseMutationResult< unknown, unknown, void, unknown > {
	const queryClient = useQueryClient();

	const selectedSiteId = useSelector( getSelectedSiteId );

	const emailDomainsQueryKey = getEmailAccountsQueryKey( selectedSiteId, domainName );
	const domainsQueryKey = getEmailDomainsQueryKey( selectedSiteId );

	const suppliedOnSettled = mutationOptions.onSettled;

	mutationOptions.onSettled = async ( data, error, variables, context ) => {
		suppliedOnSettled?.( data, error, variables, context );

		await Promise.all( [
			queryClient.invalidateQueries( emailDomainsQueryKey ),
			queryClient.invalidateQueries( domainsQueryKey ),
		] );
	};

	return useMutation(
		() =>
			wp.req.get( {
				path: `/domains/${ encodeURIComponent( domainName ) }/email/${ encodeURIComponent(
					mailboxName
				) }/delete`,
				method: 'POST',
			} ),
		mutationOptions
	);
}
