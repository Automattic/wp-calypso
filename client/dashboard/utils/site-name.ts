import { getSiteUrlWithoutProtocol } from './site-url';
import type { Site } from '../data/types';

export function getSiteName( site: Site ) {
	return site.name || getSiteUrlWithoutProtocol( site );
}
