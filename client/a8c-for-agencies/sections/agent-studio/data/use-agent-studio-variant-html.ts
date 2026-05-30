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
		// Match wpcom's `Cache-Control: max-age=60` on the deck endpoint.
		// `Infinity` here would persist composed HTML across sessions via
		// Calypso's React Query localStorage persister, locking the
		// preview to whichever fitter / layout director was current when
		// the page was first fetched.
		staleTime: 60_000,
	} );
}
