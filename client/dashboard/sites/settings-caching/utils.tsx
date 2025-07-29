import type { Site } from 'calypso/data/types';

export function isEdgeCacheAvailable( site: Site ) {
	return ! site.is_private && ! site.is_coming_soon;
}
