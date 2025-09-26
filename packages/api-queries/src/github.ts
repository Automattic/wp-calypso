import {
	fetchGithubInstallations,
	fetchGithubRepositories,
	fetchGithubRepositoryBranches,
	fetchGithubRepositoryChecks,
	fetchGithubWorkflowChecks,
} from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const githubInstallationsQuery = () =>
	queryOptions( {
		queryKey: [ 'github', 'installations' ],
		queryFn: () => fetchGithubInstallations(),
		meta: {
			persist: false,
		},
	} );

export const githubRepositoriesQuery = ( installationId: number ) =>
	queryOptions( {
		queryKey: [ 'github', 'installation', installationId, 'repositories' ],
		queryFn: () => fetchGithubRepositories( installationId ),
		meta: {
			persist: false,
		},
	} );

export const githubRepositoryBranchesQuery = (
	installationId: number,
	repositoryOwner: string,
	repositoryName: string
) =>
	queryOptions( {
		queryKey: [
			'github',
			'installation',
			installationId,
			'repository',
			repositoryOwner,
			repositoryName,
			'branches',
		],
		queryFn: () => fetchGithubRepositoryBranches( installationId, repositoryOwner, repositoryName ),
		meta: {
			persist: false,
		},
	} );

export const githubRepositoryChecksQuery = (
	installationId: number,
	repositoryOwner: string,
	repositoryName: string,
	repositoryBranch: string
) =>
	queryOptions( {
		queryKey: [
			'github',
			'installation',
			installationId,
			'repository',
			repositoryOwner,
			repositoryName,
			'branch',
			repositoryBranch,
			'checks',
		],
		queryFn: () =>
			fetchGithubRepositoryChecks(
				installationId,
				repositoryOwner,
				repositoryName,
				repositoryBranch
			),
		meta: {
			persist: false,
		},
	} );

export const githubWorkflowChecksQuery = (
	repositoryOwner: string,
	repositoryName: string,
	repositoryBranch: string,
	workflowFilename: string
) =>
	queryOptions( {
		queryKey: [
			'github',
			'repository',
			repositoryOwner,
			repositoryName,
			'branch',
			repositoryBranch,
			'workflow',
			workflowFilename,
			'checks',
		],
		queryFn: () =>
			fetchGithubWorkflowChecks(
				repositoryOwner,
				repositoryName,
				repositoryBranch,
				workflowFilename
			),
		meta: {
			persist: false,
		},
	} );
