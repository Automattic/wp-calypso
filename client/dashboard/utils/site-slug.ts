import { urlToSlug } from 'calypso/lib/url';
import type { Site } from '../data/types';

// TODO: handle site collisions as well somehow. See: https://github.com/Automattic/wp-calypso/pull/65938
export function getSiteSlug( site: Site ) {
	return urlToSlug( site.URL );
}
