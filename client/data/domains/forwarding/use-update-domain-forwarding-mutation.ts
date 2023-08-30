import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { DomainsApiError } from 'calypso/lib/domains/types';
import wp from 'calypso/lib/wp';
import { domainForwardingQueryKey } from './domain-forwarding-query-key';

export type DomainForwardingUpdate = {
	domain_redirect_id: number;
	subdomain: string;
	targetHost: string;
	targetPath: string;
	forwardPaths: boolean;
	isSecure: boolean;
	isPermanent: boolean;
	isActive: boolean;
	sourcePath: string | null;
};

export default function useUpdateDomainForwardingMutation(
	domainName: string,
	queryOptions: {
		onSuccess?: () => void;
		onError?: ( error: DomainsApiError ) => void;
	}
) {
	const queryClient = useQueryClient();
	const mutation = useMutation( {
		mutationFn: ( forwarding: DomainForwardingUpdate ) =>
			wp.req.post( `/sites/all/domain/${ domainName }/redirects`, {
				domain_redirect_id: forwarding.domain_redirect_id,
				domain: domainName,
				subdomain: forwarding.subdomain,
				target_host: forwarding.targetHost,
				target_path: forwarding.targetPath,
				forward_paths: forwarding.forwardPaths,
				is_secure: forwarding.isSecure,
				is_permanent: forwarding.isPermanent,
				is_active: forwarding.isActive,
				source_path: forwarding.sourcePath,
			} ),
		...queryOptions,
		onSuccess() {
			queryClient.invalidateQueries( domainForwardingQueryKey( domainName ) );
			queryOptions.onSuccess?.();
		},
	} );

	const { mutate } = mutation;

	const updateDomainForwarding = useCallback(
		( forwarding: DomainForwardingUpdate ) => mutate( forwarding ),
		[ mutate ]
	);

	return { updateDomainForwarding, ...mutation };
}
