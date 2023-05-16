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

type JetpackSearchAIConfig = {
	siteId: number | string;
	query: string;
	stopAt: string;
	enabled: boolean;
};

export type JetpackSearchAIResult = {
	response: string;
	step: string;
	urls: AIResponseURL[];
	terms: string[];
};

export function useJetpackSearchAIQuery( config: JetpackSearchAIConfig ) {
	return useQuery< JetpackSearchAIResult >(
		[ 'aiQuery', config.query, config.stopAt ],
		() =>
			canAccessWpcomApis()
				? wpcomRequest( {
						path: `sites/${ config.siteId }/jetpack-search/ai/search`,
						apiNamespace: 'wpcom/v2/',
						apiVersion: '2',
						query: `query=${ encodeURIComponent( config.query ) }&stop_at=${ config.stopAt }`,
				  } )
				: apiFetch( {
						global: true,
						path: `/sites/${ config.siteId }/jetpack-search/ai/search?query=${ encodeURIComponent(
							config.query
						) }&stop_at=${ config.stopAt }`,
				  } as APIFetchOptions ),
		{
			refetchOnWindowFocus: false,
			keepPreviousData: false,
			enabled: config.enabled && !! config.query,
			retry: false,
		}
	);
}
