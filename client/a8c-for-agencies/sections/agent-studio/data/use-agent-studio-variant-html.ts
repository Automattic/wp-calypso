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

// Per-tab cache-buster. Stable for the lifetime of the React tree (React
// Query and the browser HTTP cache both treat the URL as one resource for
// the session), regenerated on full reload so the user picks up any
// fit.js update wpcom has rolled out since their last visit. The wpcom
// collateral endpoint embeds fit.js bytes into the response, so a
// `immutable` cache header (deployed at one point in this endpoint's
// history) would otherwise pin the iframe to whichever fitter was on
// disk when the user first loaded the preview.
const SESSION_BUSTER = typeof window === 'undefined' ? 0 : Date.now();
const appendBuster = ( url: string ): string =>
	`${ url }${ url.includes( '?' ) ? '&' : '?' }_t=${ SESSION_BUSTER }`;

export const fetchAgentStudioVariantHtml = async ( htmlUrl: string ): Promise< string > => {
	const token = oauthToken.getToken();
	const response = await fetch( appendBuster( htmlUrl ), {
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
