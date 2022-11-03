import { apiFetch } from '@wordpress/data-controls';
import { useQuery } from 'react-query';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';

export type SupportArticleResult = {
	id: string;
	post_id?: string;
	title: string;
	description: string;
	link: string;
};

interface APIFetchOptions {
	global: boolean;
	path: string;
}

export function useSibylQuery( query: string, isJetpackSite: boolean, isAtomic: boolean ) {
	const site = ! isJetpackSite || isAtomic ? 'wpcom' : 'jpop';

	return useQuery< SupportArticleResult[] >(
		query,
		async () =>
			canAccessWpcomApis()
				? await wpcomRequest( {
						path: 'help/sibyl',
						apiNamespace: 'wpcom/v2/',
						apiVersion: '2',
						query: `query=${ encodeURIComponent( query ) }&site=${ site }`,
				  } )
				: ( ( await apiFetch( {
						path: 'help-center/sibyl',
						global: true,
						query: `query=${ encodeURIComponent( query ) }&site=${ site }`,
				  } as APIFetchOptions ) ) as SupportArticleResult[] ),
		{
			refetchOnWindowFocus: false,
			keepPreviousData: true,
			enabled: !! query,
		}
	);
}
