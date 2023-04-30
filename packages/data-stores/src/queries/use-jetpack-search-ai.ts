import { useQuery } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';

type AIResponseURL = {
	url: string;
	title: string;
};

export type JetpackSearchAIResult = {
	response: string;
	step: string;
	urls: AIResponseURL[];
	terms: string[];
};

export function useJetpackSearchAIQuery( siteId: number | string, query: string, stopAt: string ) {
	return useQuery< JetpackSearchAIResult >(
		[ query ],
		async () =>
			await wpcomRequest( {
				path: `sites/${ siteId }/jetpack-search/ai/search`,
				apiNamespace: 'wpcom/v2/',
				apiVersion: '2',
				query: `query=${ encodeURIComponent( query ) }&stop_at=${ stopAt }`,
			} ),
		{
			refetchOnWindowFocus: false,
			keepPreviousData: false,
			enabled: !! query,
		}
	);
}
