import { UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import wpcomRequest from 'wpcom-proxy-request';
import { fetchSiteDomains } from 'calypso/state/sites/domains/actions'; //eslint-disable-line no-restricted-imports
import { getAllDomainsQueryKey } from '../queries/use-all-domains-query';
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
	const dispatch = useDispatch();

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
		onSuccess: ( data: TData, variables: BulkUpdateVariables ) => {
			const { type } = variables;

			if ( type !== 'set-auto-renew' ) {
				return;
			}

			const { blogIds } = variables;

			// Refreshes data for all the domains that were updated
			blogIds.forEach( ( blogId ) => {
				dispatch( fetchSiteDomains( blogId ) );

				queryClient.invalidateQueries( { queryKey: getSiteDomainsQueryKey( blogId ) } );
				queryClient.invalidateQueries( { queryKey: getAllDomainsQueryKey( { no_wpcom: true } ) } );
			} );
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
