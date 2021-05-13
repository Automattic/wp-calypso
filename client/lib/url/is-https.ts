/**
 * Internal dependencies
 */
import { URL as URLString } from 'calypso/types';

export default function isHttps( url: URLString ): boolean {
	return !! url && url.startsWith( 'https://' );
}
