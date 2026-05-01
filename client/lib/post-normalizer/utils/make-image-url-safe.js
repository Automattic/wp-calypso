import { getUrlParts, getUrlFromParts, safeImageUrl } from '@automattic/calypso-url';
import { maxWidthPhotonishURL } from 'calypso/lib/post-normalizer/utils/max-width-photonish-url';
import { resolveRelativePath } from 'calypso/lib/url';

/**
 * Mutates a property on an object so that its image URL is safe and
 * optionally constrained to a maximum display width.
 *
 * If the URL stored at `object[propName]` is relative and a `baseURL` is
 * provided, the URL is resolved to an absolute URL using the base's protocol,
 * hostname, and path. The URL is then passed through `safeImageUrl` to strip
 * unsafe schemes. When `maxWidth` is supplied the URL is further processed by
 * `maxWidthPhotonishURL` to request an appropriately sized image from
 * Photon-compatible CDNs.
 *
 * @param {Object} object - The object whose property will be updated in place.
 * @param {string} propName - The name of the property on `object` that holds the image URL.
 * @param {number} [maxWidth] - Optional maximum width in pixels; triggers Photon resizing.
 * @param {string} [baseURL] - Optional base URL used to resolve relative image URLs.
 * @returns {void}
 */
export function makeImageURLSafe( object, propName, maxWidth, baseURL ) {
	if ( object && object[ propName ] ) {
		const urlParts = getUrlParts( object[ propName ] );
		if ( baseURL && ! urlParts.hostname ) {
			const {
				pathname: basePath,
				protocol: baseProtocol,
				hostname: baseHostname,
			} = getUrlParts( baseURL );
			const resolvedPath = resolveRelativePath( basePath, object[ propName ] );
			object[ propName ] = getUrlFromParts( {
				...urlParts,
				protocol: baseProtocol,
				hostname: baseHostname,
				pathname: resolvedPath,
			} ).href;
		}
		object[ propName ] = safeImageUrl( object[ propName ] );

		if ( maxWidth ) {
			object[ propName ] = maxWidthPhotonishURL( object[ propName ], maxWidth );
		}
	}
}
