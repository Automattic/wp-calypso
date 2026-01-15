import { wpcom } from '../wpcom-fetcher';

/**
 * Install a plugin on the given site via the public WordPress.com API.
 *
 * This maps to:
 *   https://public-api.wordpress.com/rest/v1.1/sites/:site/plugins/install?http_envelope=1
 *
 * The `site` must be provided by the caller and is passed through to the
 * underlying REST endpoint. The plugin `slug` is supplied by the caller
 * and sent in the request body.
 */
export function installPlugin( siteId: number, slug: string ): Promise< unknown > {
	return wpcom.req.post(
		{
			path: `/sites/${ encodeURIComponent( String( siteId ) ) }/plugins/install`,
			apiVersion: '1.1',
		},
		{
			slug,
		}
	);
}
