/**
 * Internal dependencies
 */
import { empty, getHttpData, requestHttpData } from 'state/data-layer/http-data';
import { http } from 'state/data-layer/wpcom-http/actions';
import { SiteId } from 'types';

export const dataKey = ( siteId: number ) => `wpcom__jetpack-blogs__keys:${ siteId }`;

interface ResponseData {
	keys: {
		akismet?: string;
		vaultpress?: string;
	};
}

export function requestPluginKeys(
	siteId: SiteId,
	options: Parameters< typeof requestHttpData >[ 2 ] = {}
) {
	requestHttpData(
		dataKey( siteId ),
		http( {
			method: 'GET',
			path: `/jetpack-blogs/${ siteId }/keys`,
			apiVersion: '1.1',
		} ),
		{
			// Defaults
			fromApi: () => ( data: ResponseData ) => [ [ dataKey( siteId ), data.keys ] ],
			// Allow overwrite
			...options,
		}
	);
}

export function getPluginKeys( siteId: SiteId ) {
	if ( ! siteId ) {
		return empty;
	}

	return getHttpData( dataKey( siteId ) );
}
