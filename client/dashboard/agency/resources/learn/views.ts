import type { View } from '@wordpress/dataviews';

// The grid renders its own cards, so DataViews only lays out the list.
export const LAYOUT_FIELDS = {
	grid: [],
	table: [ 'product', 'content_type', 'stage' ],
};

export type LayoutType = keyof typeof LAYOUT_FIELDS;

export const DEFAULT_VIEW: View = {
	type: 'grid',
	titleField: 'name',
	descriptionField: 'description',
	fields: LAYOUT_FIELDS.grid,
	search: '',
	filters: [],
};
