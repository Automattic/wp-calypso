import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import { GITHUB_DEPLOYMENTS_QUERY_KEY } from './constants';

const fetchInstallations = (): GitHubInstallationData[] =>
	wp.req.get( {
		path: `/hosting/github/installations`,
		apiNamespace: 'wpcom/v2',
	} );

const GITHUB_DEPLOYMENTS_INSTALLATIONS_QUERY_KEY = [
	GITHUB_DEPLOYMENTS_QUERY_KEY,
	'github-installations',
];

export interface GitHubInstallationData {
	external_id: number;
	account_name: string;
	management_url: string;
	repository_selection: 'all' | 'selected';
}

export const useGithubInstallationsQuery = (
	options?: Partial< UseQueryOptions< GitHubInstallationData[] > >
) => {
	return useQuery< GitHubInstallationData[] >( {
		queryKey: GITHUB_DEPLOYMENTS_INSTALLATIONS_QUERY_KEY,
		queryFn: fetchInstallations,
		retry: false,
		retryOnMount: false,
		refetchOnMount: false,
		meta: { persist: false },
		...options,
	} );
};
