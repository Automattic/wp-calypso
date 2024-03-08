import apiFetch from '@wordpress/api-fetch';
import { getQueryArg } from '@wordpress/url';
import wpcomRequest from 'wpcom-proxy-request';
import defaultFetchHandler from './default';
import type { APIFetchMiddleware } from '@wordpress/api-fetch';

/**
 * Creates an embed response emulating core's fallback link.
 */
function createFallbackResponse( url: string ) {
	const link = document.createElement( 'a' );
	link.href = url;
	link.innerText = url;
	return {
		html: link.outerHTML,
		type: 'rich',
		provider_name: 'Embed',
	};
}

export type EmbedRequestParams = {
	path: string;
	query: string;
	apiNamespace: string;
};

export function addApiMiddleware(
	requestParamsGenerator: ( embedURL: string ) => EmbedRequestParams
) {
	apiFetch.setFetchHandler( ( options ) => {
		const { path } = options;

		if ( path?.startsWith( '/oembed/1.0/proxy' ) ) {
			const url = new URL( 'https://wordpress.com' + path );
			const embedUrl = url.searchParams.get( 'url' );

			if ( embedUrl ) {
				return wpcomRequest( requestParamsGenerator( embedUrl ) );
			}
			return Promise.reject( new Error( 'Invalid embed URL' ) );
		}

		return defaultFetchHandler( options );
	} );

	// Add a middleware to handle calls to site that are not available.
	apiFetch.use( async ( options, next ): ReturnType< APIFetchMiddleware > => {
		if ( options.path?.startsWith( '/wp/v2/themes?context=edit&status=active' ) ) {
			return {
				body: [],
			};
		}

		return next( options );
	} );

	/**
	 * Transform oEmbed response.
	 * See: wp-content/plugins/gutenberg-wpcom/gutenberg-wpcom-embed.js?
	 */
	const transformOEmbedApiResponse: APIFetchMiddleware = async ( options, next ) => {
		if ( options.path && options.path.indexOf( 'oembed' ) !== -1 ) {
			const url = getQueryArg( options.path, 'url' );
			const response = next( options );

			return new Promise( function ( resolve ) {
				response
					.then( function ( data ) {
						if ( data.html ) {
							/**
							 * Removes wrappers from YouTube, Vimeo & Dailymotion block, e.g.
							 * <span class="embed-youtube">, <div class="embed-vimeo"> & <div class="embed-dailymotion">
							 * and return just the <iframe> child directly to allow wide & full width sizing.
							 * See: https://github.com/Automattic/wp-calypso/issues/43047
							 */
							const doc = document.implementation.createHTMLDocument( '' );
							doc.body.innerHTML = data.html;
							const wrapper = doc.querySelector(
								'[class="embed-youtube"],[class="embed-vimeo"],[class="embed-dailymotion"],[class="embed-spotify"]'
							);
							data.html = wrapper ? wrapper.innerHTML : data.html;
						}

						resolve( data );
					} )
					.catch( function () {
						if ( url ) {
							resolve( createFallbackResponse( url.toString() ) );
						}
					} );
			} );
		}
		return next( options );
	};

	apiFetch.use( transformOEmbedApiResponse );
}
