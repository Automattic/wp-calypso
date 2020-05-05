/**
 * External Dependencies
 */
import url from 'url';

/**
 * Internal Dependencies
 */
import { maxWidthPhotonishURL } from 'lib/post-normalizer/utils/max-width-photonish-url';
import safeImageURL from 'lib/safe-image-url';

export function makeImageURLSafe( object, propName, maxWidth, baseURL ) {
	if ( object && object[ propName ] ) {
		if ( baseURL && ! url.parse( object[ propName ], true, true ).hostname ) {
			object[ propName ] = url.resolve( baseURL, object[ propName ] );
		}
		object[ propName ] = safeImageURL( object[ propName ] );

		if ( maxWidth ) {
			object[ propName ] = maxWidthPhotonishURL( object[ propName ], maxWidth );
		}
	}
}
