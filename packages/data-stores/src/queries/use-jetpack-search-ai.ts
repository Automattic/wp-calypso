import { useQuery } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';

type AIResponseURL = {
	url: string;
	title: string;
};

interface APIFetchOptions {
	global: boolean;
	path: string;
}

export type JetpackSearchAIResult = {
	response: string;
	step: string;
	urls: AIResponseURL[];
	terms: string[];
};

export function useJetpackSearchAIQuery( siteId: number | string, query: string, stopAt: string ) {
	return useQuery< JetpackSearchAIResult >(
		[ 'aiQuery', query, stopAt ],
	 () =>
			canAccessWpcomApis()
				? wpcomRequest( {
						path: `sites/${ siteId }/jetpack-search/ai/search`,
						apiNamespace: 'wpcom/v2/',
						apiVersion: '2',
						query: `query=${ encodeURIComponent( query ) }&stop_at=${ stopAt }`,
				  } )
				: apiFetch( {
						global: true,
						path: `/sites/${ siteId }/jetpack-search/ai/search?query=${ encodeURIComponent(
							query
						) }&stop_at=${ stopAt }`,
				  } as APIFetchOptions ),
		{
			refetchOnWindowFocus: false,
			keepPreviousData: false,
			enabled: !! query,
		}
	);
}
