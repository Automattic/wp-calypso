import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import { addQueryArgs } from '@wordpress/url';
import wp from 'calypso/lib/wp';
import { GITHUB_DEPLOYMENTS_QUERY_KEY } from 'calypso/my-sites/github-deployments/constants';

export const CODE_DEPLOYMENTS_QUERY_KEY = 'code-deployments';

export interface Workflows {
	file_name: string;
}

export const useDeploymentWorkflowsQuery = (
	installationId: number,
	repositoryId: number,
	options?: Partial< UseQueryOptions< Workflows[] > >
) => {
	const path = addQueryArgs( '/hosting/github/workflows', {
		installation_id: installationId,
		repository_id: repositoryId,
	} );

	return useQuery< Workflows[] >( {
		queryKey: [ GITHUB_DEPLOYMENTS_QUERY_KEY, CODE_DEPLOYMENTS_QUERY_KEY, repositoryId ],
		queryFn: (): Workflows[] =>
			wp.req.get( {
				path,
				apiNamespace: 'wpcom/v2',
			} ),
		meta: {
			persist: false,
		},
		...options,
	} );
};
