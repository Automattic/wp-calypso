import type { Site } from '../data/types';

export function getSiteUrlWithoutProtocol( site: Site ) {
	return site.URL.replace( 'https://', '' ).replace( 'http://', '' );
}
