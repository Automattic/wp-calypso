import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import wpcomRequest from 'wpcom-proxy-request';

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

export function useDomainsBulkActionsMutation() {
	const { mutate, ...rest } = useMutation( {
		mutationFn: async ( variables: BulkUpdateVariables ) => {
			switch ( variables.type ) {
				case 'set-auto-renew':
					return await wpcomRequest( {
						path: `/domains/bulk-actions/${ variables.type }`,
						apiNamespace: 'wpcom/v2',
						method: 'POST',
						body: {
							domains: variables.domains,
							auto_renew: variables.autoRenew,
						},
					} );

				case 'update-contact-info':
					return await wpcomRequest( {
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
