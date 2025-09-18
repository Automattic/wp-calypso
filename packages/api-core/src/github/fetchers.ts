import { addQueryArgs } from '@wordpress/url';
import { wpcom } from '../wpcom-fetcher';
import type { GitHubInstallation, GitHubRepository, GitHubRepositoryChecks } from './types';

export async function fetchGithubInstallations(): Promise< GitHubInstallation[] > {
	return wpcom.req.get( {
		path: '/hosting/github/installations',
		apiNamespace: 'wpcom/v2',
	} );
}

export async function fetchGithubRepositories(
	installationId: number
): Promise< GitHubRepository[] > {
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
): Promise< GitHubRepositoryChecks > {
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
