import { useQuery } from '@tanstack/react-query';
import { addQueryArgs } from '@wordpress/url';
import wp from 'calypso/lib/wp';
import { GITHUB_DEPLOYMENTS_QUERY_KEY } from './constants';

const GITHUB_BRANCHES_QUERY_KEY = 'github-repository-checks';

export type RepositoryChecks = {
	inferred_type: string;
	has_composer: boolean;
	has_vendor: boolean;
	suggested_directory: string;
	protected_paths: string[];
};

export const useGithubRepositoryChecksQuery = (
	installationId?: number,
	repositoryOwner?: string,
	repositoryName?: string,
	repositoryBranch?: string
) => {
	return useQuery< RepositoryChecks >( {
		queryKey: [
			GITHUB_DEPLOYMENTS_QUERY_KEY,
			GITHUB_BRANCHES_QUERY_KEY,
			installationId,
			repositoryOwner,
			repositoryName,
			repositoryBranch,
		],
		queryFn: (): RepositoryChecks =>
			wp.req.get( {
				path: addQueryArgs( '/hosting/github/repository/pre-connect-checks', {
					installation_id: installationId,
					repository_owner: repositoryOwner,
					repository_name: repositoryName,
					repository_branch: repositoryBranch,
				} ),
				apiNamespace: 'wpcom/v2',
			} ),
		meta: {
			persist: false,
		},
	} );
};
