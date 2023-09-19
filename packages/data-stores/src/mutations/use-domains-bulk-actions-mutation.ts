import { UseMutationOptions, useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import wp from 'calypso/lib/wp'; // eslint-disable-line no-restricted-imports

interface UpdateContactInfoVariables {
	type: 'update-contact-info';
	domains: string[];
	transferLock: boolean;
	whois: Record< string, string >;
}

interface SetAutoRenewVariables {
	type: 'set-auto-renew';
	domains: string[];
	autoRenew: boolean;
}

type BulkUpdateVariables = UpdateContactInfoVariables | SetAutoRenewVariables;

export function useDomainsBulkActionsMutation<
	TData = unknown,
	TError = unknown,
	TContext = unknown
>( options: UseMutationOptions< TData, TError, BulkUpdateVariables, TContext > = {} ) {
	const { mutate, ...rest } = useMutation( {
		mutationFn: ( variables ) => {
			switch ( variables.type ) {
				case 'set-auto-renew':
					return wp.req.post( {
						path: `/domains/bulk-actions/${ variables.type }`,
						apiNamespace: 'wpcom/v2',
						body: {
							domains: variables.domains,
							auto_renew: variables.autoRenew,
						},
					} );

				case 'update-contact-info':
					return wp.req.post( {
						path: `/domains/bulk-actions/${ variables.type }`,
						apiNamespace: 'wpcom/v2',
						body: {
							domains: variables.domains,
							transfer_lock: variables.transferLock,
							whois: variables.whois,
						},
					} );
			}
		},
		...options,
	} );

	const setAutoRenew = useCallback(
		( domains: string[], autoRenew: boolean ) =>
			mutate( { type: 'set-auto-renew', domains, autoRenew } ),
		[ mutate ]
	);

	const updateContactInfo = useCallback(
		( domains: string[], transferLock: boolean, whois: Record< string, string > ) =>
			mutate( { type: 'update-contact-info', domains, transferLock, whois } ),
		[ mutate ]
	);

	return { setAutoRenew, updateContactInfo, ...rest };
}
