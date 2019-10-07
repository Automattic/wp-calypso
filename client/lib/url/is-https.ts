/**
 * Internal dependencies
 */
import { URL as TypedURL } from 'types';

export default function isHttps( url: TypedURL ): boolean {
	return !! url && url.startsWith( 'https://' );
}
