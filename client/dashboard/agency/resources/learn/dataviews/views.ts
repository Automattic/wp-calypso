import type { View } from '@wordpress/dataviews';

// The grid renders its own cards, so DataViews only lays out the list.
export const DEFAULT_LAYOUTS = {
	grid: { fields: [] },
	table: { fields: [ 'product', 'content_type', 'stage' ] },
};

export const DEFAULT_VIEW: View = {
	type: 'grid',
	titleField: 'name',
	descriptionField: 'description',
	fields: DEFAULT_LAYOUTS.grid.fields,
	search: '',
	filters: [],
};
