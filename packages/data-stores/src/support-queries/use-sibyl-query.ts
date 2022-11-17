import apiFetch, { APIFetchOptions } from '@wordpress/api-fetch';
import { useQuery } from 'react-query';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';

export type SupportArticleResult = {
	id: string;
	post_id?: string;
	title: string;
	description: string;
	link: string;
};

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
						path: `help-center/sibyl?query=${ encodeURIComponent( query ) }&site=${ site }`,
						global: true,
				  } as APIFetchOptions ) ) as SupportArticleResult[] ),
		{
			refetchOnWindowFocus: false,
			keepPreviousData: true,
			enabled: !! query,
		}
	);
}
