import { addQueryArgs } from '@wordpress/url';
import { wpcom } from '../wpcom-fetcher';
import type {
	GithubInstallation,
	GithubRepository,
	GithubRepositoryChecks,
	GithubWorkflow,
	GithubWorkflowTemplate,
	GithubWorkflowValidation,
} from './types';

export async function fetchGithubInstallations(): Promise< GithubInstallation[] > {
	return wpcom.req.get( {
		path: '/hosting/github/installations',
		apiNamespace: 'wpcom/v2',
	} );
}

export async function fetchGithubRepositories(
	installationId: number
): Promise< GithubRepository[] > {
	return wpcom.req.get( {
		path: addQueryArgs( '/hosting/github/repositories', {
			installation_id: installationId,
		} ),
		apiNamespace: 'wpcom/v2',
	} );
}

export async function fetchGithubRepositoryBranches(
	installationId: number,
	repositoryOwner: string,
	repositoryName: string
): Promise< string[] > {
	return wpcom.req.get( {
		path: addQueryArgs( '/hosting/github/repository/branches', {
			installation_id: installationId,
			repository_owner: repositoryOwner,
			repository_name: repositoryName,
		} ),
		apiNamespace: 'wpcom/v2',
	} );
}

export async function fetchGithubRepositoryChecks(
	installationId: number,
	repositoryOwner: string,
	repositoryName: string,
	repositoryBranch: string
): Promise< GithubRepositoryChecks > {
	return wpcom.req.get( {
		path: addQueryArgs( '/hosting/github/repository/pre-connect-checks', {
			installation_id: installationId,
			repository_owner: repositoryOwner,
			repository_name: repositoryName,
			repository_branch: repositoryBranch,
		} ),
		apiNamespace: 'wpcom/v2',
	} );
}

export async function fetchGithubWorkflowChecks(
	repositoryOwner: string,
	repositoryName: string,
	repositoryBranch: string,
	workflowFilename: string
): Promise< GithubWorkflowValidation > {
	return wpcom.req.get( {
		path: addQueryArgs( '/hosting/github/workflows/checks', {
			repository_owner: repositoryOwner,
			repository_name: repositoryName,
			branch_name: repositoryBranch,
			workflow_filename: workflowFilename,
		} ),
		apiNamespace: 'wpcom/v2',
	} );
}

export async function fetchGithubWorkflowTemplates(
	repositoryBranch: string,
	template: 'simple' | 'with_composer'
): Promise< GithubWorkflowTemplate > {
	return wpcom.req.get( {
		path: addQueryArgs( '/hosting/github/workflow-templates', {
			branch_name: repositoryBranch,
			template,
		} ),
		apiNamespace: 'wpcom/v2',
	} );
}

export async function fetchGithubWorkflows(
	repositoryOwner: string,
	repositoryName: string,
	branchName: string
): Promise< GithubWorkflow[] > {
	return wpcom.req.get( {
		path: addQueryArgs( '/hosting/github/workflows', {
			repository_owner: repositoryOwner,
			repository_name: repositoryName,
			branch_name: branchName,
		} ),
		apiNamespace: 'wpcom/v2',
	} );
}
