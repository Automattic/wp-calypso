import type { View } from '@wordpress/dataviews';

export function getViewFilteredByUpdates( view: View, field: string, yesValue: unknown ): View {
	const existingFilters = view.filters || [];

	// If the updates filter is already applied with the same operator and value,
	// toggle it off by removing it. Otherwise, apply it.
	const hasUpdateFilterApplied = existingFilters.some( ( filter ) => {
		return filter.field === field && filter.operator === 'is' && filter.value === yesValue;
	} );

	if ( hasUpdateFilterApplied ) {
		return {
			...view,
			page: 1,
			filters: existingFilters.filter( ( filter ) => filter.field !== field ),
		};
	}

	const otherFilters = existingFilters.filter( ( filter ) => filter.field !== field );

	return {
		...view,
		page: 1,
		filters: [
			...otherFilters,
			{
				field,
				operator: 'is',
				value: yesValue,
			},
		],
	};
}
