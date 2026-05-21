/**
 * Fetches a collateral variant's composed HTML. Raw `fetch` (not
 * `wpcom.req.get`) because the endpoint emits `text/html` and
 * superagent would land the body in `response.text`, not `response.body`.
 */
import * as oauthToken from '@automattic/oauth-token';
import { useQuery } from '@tanstack/react-query';

export const getAgentStudioVariantHtmlQueryKey = ( htmlUrl: string | undefined ) => [
	'a4a-agent-studio-variant-html',
	htmlUrl,
];

export const fetchAgentStudioVariantHtml = async ( htmlUrl: string ): Promise< string > => {
	const token = oauthToken.getToken();
	const response = await fetch( htmlUrl, {
		headers: {
			Accept: 'text/html',
			...( typeof token === 'string' ? { Authorization: `Bearer ${ token }` } : {} ),
		},
	} );
	if ( ! response.ok ) {
		throw new Error( `GET variant html ${ response.status }: ${ await response.text() }` );
	}
	return response.text();
};

export default function useAgentStudioVariantHtml( htmlUrl: string | undefined ) {
	return useQuery< string >( {
		queryKey: getAgentStudioVariantHtmlQueryKey( htmlUrl ),
		queryFn: () => fetchAgentStudioVariantHtml( htmlUrl as string ),
		enabled: !! htmlUrl,
		refetchOnWindowFocus: false,
		staleTime: Infinity,
	} );
}
