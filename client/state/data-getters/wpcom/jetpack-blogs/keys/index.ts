/**
 * Internal dependencies
 */
import { empty, getHttpData, requestHttpData } from 'calypso/state/data-layer/http-data';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { SiteId } from 'calypso/types';

export const dataKey = ( siteId: number ) => `wpcom__jetpack-blogs__keys:${ siteId }`;

interface ResponseData {
	keys: {
		akismet?: string;
		vaultpress?: string;
	};
}

export function requestPluginKeys( siteId: SiteId ) {
	requestHttpData(
		dataKey( siteId ),
		http( {
			method: 'GET',
			path: `/jetpack-blogs/${ siteId }/keys`,
			apiVersion: '1.1',
		} ),
		{
			fromApi: () => ( data: ResponseData ) => [ [ dataKey( siteId ), data.keys ] ],
			freshness: -Infinity,
		}
	);
}

export function getPluginKeys( siteId: SiteId ) {
	if ( ! siteId ) {
		return empty;
	}

	return getHttpData( dataKey( siteId ) );
}
