import { __ } from '@wordpress/i18n';
import type { sampleResources } from './sample-resources';
import type { CardColorBy } from './temporary-design-switch';

type Resource = ( typeof sampleResources )[ number ];
export const topResources = [ 'sample-01', 'sample-06', 'sample-11', 'sample-27', 'sample-42' ];

const productColorSlots: Record< string, number > = {
	'WordPress VIP': 1,
	Pressable: 2,
	WooCommerce: 3,
	'WordPress.com': 4,
	Jetpack: 5,
	'Automattic for Agencies': 6,
};
const typeColorSlots: Record< string, number > = {
	Guide: 1,
	Video: 2,
	Checklist: 3,
	'Slide deck': 4,
	'One-pager': 5,
	'Talk track': 6,
	'Case study': 7,
};

export function getResourceColorSlot( resource: Resource, colorBy: CardColorBy ) {
	return (
		( colorBy === 'product'
			? productColorSlots[ resource.product ]
			: typeColorSlots[ resource.format ] ) ?? 6
	);
}

export function getResourceTags( resource: Resource, showType = true ) {
	return [
		...( topResources.includes( resource.id )
			? [ { field: 'featured', value: __( 'Top resource' ) } ]
			: [] ),
		...( showType ? [ { field: 'format', value: resource.format } ] : [] ),
		{ field: 'audience', value: resource.audience },
		{ field: 'product', value: resource.product },
	];
}
