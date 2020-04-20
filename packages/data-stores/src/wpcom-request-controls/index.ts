/**
 * External dependencies
 */
import wpcomProxyRequest, {
	reloadProxy as triggerReloadProxy,
	requestAllBlogsAccess as triggerRequestAllBlogsAccess,
} from 'wpcom-proxy-request';

type WpcomProxyRequestOptions = Parameters< typeof wpcomProxyRequest >[ 0 ];

export const wpcomRequest = ( request: WpcomProxyRequestOptions ) =>
	( { type: 'WPCOM_REQUEST', request } as const );

/**
 * Action for performing a fetching using `window.fetch()` and parsing the response body.
 * It's different from `apiFetch()` from
 * `@wordpress/data-controls` in that it doesn't use any middleware to add extra parameters.
 *
 * @param resource the resource you wish to fetch
 * @param options request options
 */
export const fetchAndParse = (
	resource: Parameters< typeof window.fetch >[ 0 ],
	options: Parameters< typeof window.fetch >[ 1 ]
) =>
	( {
		type: 'FETCH_AND_PARSE',
		resource,
		options,
	} as const );

export const reloadProxy = () =>
	( {
		type: 'RELOAD_PROXY',
	} as const );

export const requestAllBlogsAccess = () =>
	( {
		type: 'REQUEST_ALL_BLOGS_ACCESS',
	} as const );

export const wait = ( ms: number ) => ( { type: 'WAIT', ms } as const );

export const controls = {
	WPCOM_REQUEST: ( { request }: ReturnType< typeof wpcomRequest > ) => wpcomProxyRequest( request ),
	FETCH_AND_PARSE: async ( { resource, options }: ReturnType< typeof fetchAndParse > ) => {
		const response = await window.fetch( resource, options );

		return {
			ok: response.ok,
			body: await response.json(),
		};
	},
	RELOAD_PROXY: () => {
		triggerReloadProxy();
	},
	REQUEST_ALL_BLOGS_ACCESS: () => triggerRequestAllBlogsAccess(),
	WAIT: ( { ms }: ReturnType< typeof wait > ) =>
		new Promise( ( resolve ) => setTimeout( resolve, ms ) ),
} as const;
