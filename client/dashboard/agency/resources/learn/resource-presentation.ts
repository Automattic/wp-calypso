import { __ } from '@wordpress/i18n';
import { hubFeaturedIds } from './hub-resources';
import type { LibraryResource } from './types';

export const topResources = hubFeaturedIds;

export function getResourceTags( resource: LibraryResource, showType = true ) {
	return [
		...( topResources.includes( resource.id )
			? [ { field: 'featured', value: __( 'Top resource' ) } ]
			: [] ),
		...( showType ? [ { field: 'contentType', value: resource.contentType } ] : [] ),
		{ field: 'audience', value: resource.audience },
		...( resource.stage ? [ { field: 'stage', value: resource.stage } ] : [] ),
	];
}
