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

// `rest_url()` injects `/sites/<blog_id>/` into wpcom/v2 paths on
// public-api.wordpress.com, which 404s our route. Strip it.
const normalizeHtmlUrl = ( url: string ): string =>
	url.replace( /\/wpcom\/v2\/sites\/\d+\//, '/wpcom/v2/' );

export const fetchAgentStudioVariantHtml = async ( htmlUrl: string ): Promise< string > => {
	const token = oauthToken.getToken();
	const response = await fetch( normalizeHtmlUrl( htmlUrl ), {
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
