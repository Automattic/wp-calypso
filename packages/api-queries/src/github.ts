import {
	fetchGithubInstallations,
	fetchGithubRepositories,
	fetchGithubRepositoryBranches,
	fetchGithubRepositoryChecks,
	fetchGithubWorkflowChecks,
	saveGitHubCredentials,
} from '@automattic/api-core';
import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';

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

export const saveGitHubCredentialsMutation = () =>
	mutationOptions( {
		mutationFn: ( { accessToken }: { accessToken: string } ) =>
			saveGitHubCredentials( accessToken ),
		onSuccess: () => {
			queryClient.invalidateQueries( githubInstallationsQuery() );
		},
	} );
