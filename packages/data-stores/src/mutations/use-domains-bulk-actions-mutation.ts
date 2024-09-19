import { UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import wpcomRequest from 'wpcom-proxy-request';
import { getAllDomainsQueryKey } from '../queries/use-all-domains-query';
import { getBulkDomainUpdateStatusQueryKey } from '../queries/use-bulk-domain-update-status-query';
import { getSiteDomainsQueryKey } from '../queries/use-site-domains-query';

interface UpdateContactInfoVariables {
	type: 'update-contact-info';
	domains: string[];
	transferLock: boolean;
	whois: Record< string, string >;
}

interface SetAutoRenewVariables {
	type: 'set-auto-renew';
	domains: string[];
	blogIds: number[];
	autoRenew: boolean;
}

export type BulkUpdateVariables = UpdateContactInfoVariables | SetAutoRenewVariables;

export function useDomainsBulkActionsMutation<
	TData = unknown,
	TError = unknown,
	TContext = unknown,
>( options: UseMutationOptions< TData, TError, BulkUpdateVariables, TContext > = {} ) {
	const queryClient = useQueryClient();

	const { mutate, ...rest } = useMutation( {
		mutationFn: ( variables ) => {
			switch ( variables.type ) {
				case 'set-auto-renew':
					return wpcomRequest( {
						path: `/domains/bulk-actions/${ variables.type }`,
						apiNamespace: 'wpcom/v2',
						method: 'POST',
						body: {
							domains: variables.domains,
							auto_renew: variables.autoRenew,
						},
					} );

				case 'update-contact-info':
					return wpcomRequest( {
						path: `/domains/bulk-actions/${ variables.type }`,
						apiNamespace: 'wpcom/v2',
						method: 'POST',
						body: {
							domains: variables.domains,
							transfer_lock: variables.transferLock,
							whois: variables.whois,
						},
					} );
			}
		},
		onSuccess: ( data, variables ) => {
			if ( variables.type !== 'set-auto-renew' ) {
				return;
			}

			// Makes sure the success notice is shown once statuses have been updated
			queryClient.invalidateQueries( { queryKey: getBulkDomainUpdateStatusQueryKey() } );

			// Forces a refresh of the list of domains for sites with domains that were updated
			variables.blogIds.forEach( ( blogId ) => {
				queryClient.invalidateQueries( { queryKey: getSiteDomainsQueryKey( blogId ) } );
			} );

			// Forces a refresh of the list of all domains
			queryClient.invalidateQueries( { queryKey: getAllDomainsQueryKey( { no_wpcom: true } ) } );
		},
		...options,
	} );

	const setAutoRenew = useCallback(
		( domains: string[], blogIds: number[], autoRenew: boolean ) =>
			mutate( { type: 'set-auto-renew', domains, blogIds, autoRenew } ),
		[ mutate ]
	);

	const updateContactInfo = useCallback(
		( domains: string[], transferLock: boolean, whois: Record< string, string > ) =>
			mutate( { type: 'update-contact-info', domains, transferLock, whois } ),
		[ mutate ]
	);

	return { setAutoRenew, updateContactInfo, ...rest };
}
