/**
 * Fetcher for a collateral variant's composed HTML.
 *
 * Wraps `GET /a4a/collateral/<post_id>/html?variant=<id>` (whatever
 * URL the variant projection hands us in `html_url`). The endpoint
 * emits `text/html` with manually-set headers and `exit;`s before
 * WordPress's `rest_pre_serve_request` fires — the backend calls
 * `rest_send_cors_headers` inline so the response carries the CORS
 * envelope a cross-origin XHR needs to read it.
 *
 * Why a raw `fetch` instead of `wpcom.req.get`:
 *   - `wpcom.req.get` runs through superagent, which parses the
 *     response per Content-Type. For `text/html` the body lands in
 *     `response.text`, not `response.body`, and the wpcom wrapper
 *     resolves `body` (= undefined). We'd lose the HTML.
 *
 * The response is then dropped into an iframe `srcDoc` on the
 * output-detail page. We can't use `iframe src=html_url` directly
 * because the cross-site iframe load is anonymous (no Bearer, no
 * cookies), and the wpcom platform's site-access check rejects it
 * upstream of our endpoint's `permission_callback: __return_true`.
 */
import * as oauthToken from '@automattic/oauth-token';
import { useQuery } from '@tanstack/react-query';

export const getAgentStudioVariantHtmlQueryKey = ( htmlUrl: string | undefined ) => [
	'a4a-agent-studio-variant-html',
	htmlUrl,
];

/**
 * The JSON projection in `agency-a4a-collateral.php` builds `html_url`
 * via `rest_url(...)`, which on public-api.wordpress.com runs through
 * `WPCOM_REST_API_V2_Centralize::add_sites_to_rest_url()` and injects
 * `/sites/<blog_id>/` into the path for any `wpcom/v2` URL — even
 * though our route is registered without that prefix. So the URL the
 * server hands us 404s. Strip the prefix client-side until the
 * projection is fixed (planned: replace `rest_url(...)` with a
 * hardcoded host string, same pattern as share-report.php:91-94).
 */
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
		// The endpoint emits `Cache-Control: public, max-age=31536000,
		// immutable` — variant HTML is content-addressed by
		// (post_id, frame, theme), so once we have it we can keep it.
		staleTime: Infinity,
	} );
}
