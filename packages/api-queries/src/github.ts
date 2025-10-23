import {
	createGithubWorkflow,
	fetchGithubInstallations,
	fetchGithubRepositories,
	fetchGithubRepositoryBranches,
	fetchGithubRepositoryChecks,
	fetchGithubWorkflowChecks,
	fetchGithubWorkflows,
	fetchGithubWorkflowTemplates,
	type CreateWorkflowRequest,
	saveGithubCredentials,
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
			'repository-checks',
			installationId,
			repositoryOwner,
			repositoryName,
			repositoryBranch,
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
			'repository-workflow-checks',
			repositoryOwner,
			repositoryName,
			repositoryBranch,
			workflowFilename,
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

export const saveGithubCredentialsMutation = () =>
	mutationOptions( {
		mutationFn: ( { accessToken }: { accessToken: string } ) =>
			saveGithubCredentials( accessToken ),
		onSuccess: () => {
			queryClient.invalidateQueries( githubInstallationsQuery() );
		},
	} );

export const githubWorkflowTemplatesQuery = (
	repositoryBranch: string,
	template: 'simple' | 'with_composer'
) =>
	queryOptions( {
		queryKey: [ 'github', 'repository-workflow-template', repositoryBranch, template ],
		queryFn: () => fetchGithubWorkflowTemplates( repositoryBranch, template ),
	} );

export const githubWorkflowsQuery = (
	repositoryOwner: string,
	repositoryName: string,
	branchName: string
) =>
	queryOptions( {
		queryKey: [ 'github', 'repository-workflows', repositoryOwner, repositoryName, branchName ],
		queryFn: () => fetchGithubWorkflows( repositoryOwner, repositoryName, branchName ),
		meta: {
			persist: false,
		},
	} );

export const createGithubWorkflowMutation = () =>
	mutationOptions( {
		mutationFn: ( request: CreateWorkflowRequest ) => createGithubWorkflow( request ),
		onSuccess: () => {
			queryClient.invalidateQueries( {
				queryKey: [ 'github', 'repository-workflows' ],
			} );
		},
	} );
