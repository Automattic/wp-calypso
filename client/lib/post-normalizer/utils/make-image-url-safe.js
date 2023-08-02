import { getUrlParts, getUrlFromParts, safeImageUrl } from '@automattic/calypso-url';
import { maxWidthPhotonishURL } from 'calypso/lib/post-normalizer/utils/max-width-photonish-url';
import { resolveRelativePath } from 'calypso/lib/url';

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
