import { __ } from '@wordpress/i18n';
import type { sampleResources } from './sample-resources';

type Resource = ( typeof sampleResources )[ number ];
export const topResources = [ 'sample-01', 'sample-06', 'sample-11', 'sample-27', 'sample-42' ];

export function getResourceTags( resource: Resource, showType = true ) {
	return [
		...( topResources.includes( resource.id )
			? [ { field: 'featured', value: __( 'Top resource' ) } ]
			: [] ),
		...( showType ? [ { field: 'format', value: resource.format } ] : [] ),
		{ field: 'audience', value: resource.audience },
		{ field: 'stage', value: resource.stage },
	];
}
