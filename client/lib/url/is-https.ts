/**
 * Internal dependencies
 */
import { URL as URLType } from 'types';

export default function isHttps( url: URLType ): boolean {
	return !! url && url.startsWith( 'https://' );
}
