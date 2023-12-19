import apiFetch from '@wordpress/api-fetch';
import wpcomRequest from 'wpcom-proxy-request';
import defaultFetchHandler from './default';

export function addApiMiddleware( siteId: number ) {
	apiFetch.setFetchHandler( ( options ) => {
		const { path } = options;

		if ( path?.startsWith( '/oembed/1.0/proxy' ) ) {
			const url = new URL( 'https://wordpress.com' + path );
			const embedUrl = url.searchParams.get( 'url' );

			return wpcomRequest( {
				path: `/sites/${ encodeURIComponent( siteId ) }/proxy`,
				query: `url=${ embedUrl }`,
				apiNamespace: 'oembed/1.0',
			} );
		}

		return defaultFetchHandler( options );
	} );
}
