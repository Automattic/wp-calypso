/**
 * Internal dependencies
 */
import { maxWidthPhotonishURL } from 'lib/post-normalizer/utils/max-width-photonish-url';
import safeImageURL from 'lib/safe-image-url';
import { getUrlParts, resolveRelativePath, getUrlFromParts } from 'lib/url';

export function makeImageURLSafe( object, propName, maxWidth, baseURL ) {
	if ( object && object[ propName ] ) {
		const urlParts = getUrlParts( object[ propName ] );
		if ( baseURL && ! urlParts.hostname ) {
			const { pathname: basePath } = getUrlParts( baseURL );
			const resolvedPath = resolveRelativePath( basePath, object[ propName ] );
			object[ propName ] = getUrlFromParts( {
				...urlParts,
				protocol: baseURL.protocol,
				hostname: baseURL.hostname,
				pathname: resolvedPath,
			} ).href;
		}
		object[ propName ] = safeImageURL( object[ propName ] );

		if ( maxWidth ) {
			object[ propName ] = maxWidthPhotonishURL( object[ propName ], maxWidth );
		}
	}
}
