import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import { GitHubInstallation } from 'calypso/my-sites/github-deployments/types';
import { GITHUB_DEPLOYMENTS_QUERY_KEY } from './constants';

export const GITHUB_INSTALLATION_QUERY_KEY = 'github-installation';

export interface GithubInstallationData {
	ID: number;
	connected: boolean;
	external_profile_picture: string;
	repo: string;
	branch: string;
	base_path: string;
	label: string;
	external_name: string;
}

export const useGithubInstallationQuery = (
	siteId: number | null,
	options?: UseQueryOptions< GitHubInstallation[] >
) => {
	return useQuery< GitHubInstallation[] >( {
		queryKey: [ GITHUB_DEPLOYMENTS_QUERY_KEY, siteId, GITHUB_INSTALLATION_QUERY_KEY ],
		queryFn: (): GitHubInstallation[] =>
			wp.req.get( {
				path: `/sites/${ siteId }/hosting/github-app/installations`,
				apiNamespace: 'wpcom/v2',
			} ),
		enabled: !! siteId,
		meta: {
			persist: false,
		},
		...options,
	} );
};
