import apiFetch from '@wordpress/api-fetch';
import wpcomRequest from 'wpcom-proxy-request';
import defaultFetchHandler from './default';

export function addApiMiddleware() {
	apiFetch.setFetchHandler( ( options ) => {
		const { path } = options;

		if ( path?.startsWith( '/oembed/1.0/proxy' ) ) {
			const url = new URL( 'https://wordpress.com' + path );
			const embedUrl = url.searchParams.get( 'url' );

			return wpcomRequest( {
				path: '/verbum/embed',
				query: `embed_url=${ embedUrl }&embed_nonce=${ encodeURIComponent(
					VerbumComments.embedNonce
				) }`,
				apiNamespace: 'wpcom/v2',
			} );
		}

		return defaultFetchHandler( options );
	} );
}
