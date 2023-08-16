import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { DomainsApiError } from 'calypso/lib/domains/types';
import wp from 'calypso/lib/wp';
import { domainRedirectsQueryKey } from './domain-redirects-query-key';

export type DomainRedirectUpdate = {
	targetHost: string;
	targetPath: string;
	forwardPaths: boolean;
	isSecure: boolean;
	isPermanent: boolean;
	isActive: boolean;
	sourcePath: string | null;
};

export default function useUpdateDomainRedirectMutation(
	domainName: string,
	queryOptions: {
		onSuccess?: () => void;
		onError?: ( error: DomainsApiError ) => void;
	}
) {
	const queryClient = useQueryClient();
	const mutation = useMutation( {
		mutationFn: ( redirect: DomainRedirectUpdate ) =>
			wp.req.post( `/sites/all/domain/${ domainName }/redirects`, {
				domain: domainName,
				target_host: redirect.targetHost,
				target_path: redirect.targetPath,
				forward_paths: redirect.forwardPaths,
				is_secure: redirect.isSecure,
				is_permanent: redirect.isPermanent,
				is_active: redirect.isActive,
				source_path: redirect.sourcePath,
			} ),
		...queryOptions,
		onSuccess() {
			queryClient.invalidateQueries( domainRedirectsQueryKey( domainName ) );
			queryOptions.onSuccess?.();
		},
	} );

	const { mutate } = mutation;

	const updateDomainRedirect = useCallback(
		( redirect: DomainRedirectUpdate ) => mutate( redirect ),
		[ mutate ]
	);

	return { updateDomainRedirect, ...mutation };
}
