import apiFetch from '@wordpress/api-fetch';
// import wpcomRequest from 'wpcom-proxy-request';
// import defaultFetchHandler from './default';

export function addApiMiddleware() {
	// // Add a middleware to handle oEmbed requests.
	// apiFetch.setFetchHandler( ( options ) => {
	// 	const { path } = options;

	// 	if ( path?.startsWith( '/oembed/1.0/proxy' ) ) {
	// 		const url = new URL( 'https://wordpress.com' + path );
	// 		const embedUrl = url.searchParams.get( 'url' );

	// 		return wpcomRequest( {
	// 			path: '/verbum/embed',
	// 			query: `embed_url=${ embedUrl }&embed_nonce=${ encodeURIComponent(
	// 				VerbumComments.embedNonce
	// 			) }`,
	// 			apiNamespace: 'wpcom/v2',
	// 		} );
	// 	}

	// 	return defaultFetchHandler( options );
	// } );

	// Add a middleware to handle calls to site that are not available.
	apiFetch.use( ( options, next ): any => {
		if ( options.path?.startsWith( '/wp/v2/themes?context=edit&status=active' ) ) {
			return {
				body: [],
			};
		}

		return next( options );
	} );
}
