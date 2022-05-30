import { useMutation, useQueryClient } from 'react-query';
import { useSelector } from 'react-redux';
import wp from 'calypso/lib/wp';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getCacheKey as getuseGetEmailAccountsQueryKey } from './use-get-email-accounts-query';
import { getCacheKey as getuseGetEmailDomainsQueryKey } from './use-get-email-domains-query';
import type { UseMutationOptions, UseMutationResult } from 'react-query';

/**
 * Deletes a mailbox from a Professional Email (Titan) account
 *
 * @param domainName The domain name of the mailbox
 * @param mailboxName The mailbox name
 * @param mutationOptions Mutation options passed on to `useMutation`
 * @returns {{ data, error, isLoading: boolean, removeTitanMailbox: Function, ...}} Returns various parameters piped from `useMutation`
 */
export function useRemoveEmailForwardMutation(
	domainName: string,
	mailboxName: string,
	mutationOptions: UseMutationOptions = {}
): UseMutationResult< unknown, unknown, void, unknown > {
	const queryClient = useQueryClient();

	const selectedSiteId = useSelector( getSelectedSiteId );

	const useEmailsQueryKey = getuseGetEmailAccountsQueryKey( selectedSiteId, domainName );
	const useGetEmailDomainsQueryKey = getuseGetEmailDomainsQueryKey( selectedSiteId );

	mutationOptions.onSettled = async () => {
		await Promise.all( [
			queryClient.invalidateQueries( useEmailsQueryKey ),
			queryClient.invalidateQueries( useGetEmailDomainsQueryKey ),
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
