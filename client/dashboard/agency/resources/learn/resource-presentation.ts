import { __ } from '@wordpress/i18n';
import type { LibraryResource } from './types';

export const topResources = [ 'sample-01', 'sample-06', 'sample-11', 'sample-27', 'sample-42' ];

export function getResourceTags( resource: LibraryResource, showType = true ) {
	return [
		...( topResources.includes( resource.id )
			? [ { field: 'featured', value: __( 'Top resource' ) } ]
			: [] ),
		...( showType ? [ { field: 'contentType', value: resource.contentType } ] : [] ),
		{ field: 'audience', value: resource.audience },
		{ field: 'stage', value: resource.stage },
	];
}
