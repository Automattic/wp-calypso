import type { Site } from '@automattic/api-core';

export function isEdgeCacheAvailable( site: Site ) {
	return ! site.is_private && ! site.is_coming_soon;
}
