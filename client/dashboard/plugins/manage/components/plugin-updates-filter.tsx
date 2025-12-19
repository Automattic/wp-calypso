import { Button } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { PluginListRow } from '../types';
import type { View, Field } from '@wordpress/dataviews';

export const PluginUpdatesFilter = ( {
	siteCount,
	updatesField,
	view,
	onChangeView,
}: {
	siteCount: number;
	updatesField: Field< PluginListRow >;
	view: View;
	onChangeView: ( newView: View ) => void;
} ) => {
	const toggleFilterValue = ( value: boolean | string | number ) => {
		const currentFilter = view.filters?.find( ( f ) => f.field === updatesField.id );
		const isCurrentlySelected = currentFilter?.value === value;

		if ( isCurrentlySelected ) {
			// Remove the filter
			onChangeView( {
				...view,
				filters: view.filters?.filter( ( f ) => f.field !== updatesField.id ) || [],
			} );
		} else {
			// Add or update the filter
			const otherFilters = view.filters?.filter( ( f ) => f.field !== updatesField.id ) || [];
			onChangeView( {
				...view,
				filters: [
					...otherFilters,
					{
						field: updatesField.id,
						operator: 'is' as const,
						value,
					},
				],
			} );
		}
	};

	return (
		<div className="dataviews-filters__container-visibility-toggle">
			<Button
				className="dataviews-filters__visibility-toggle"
				size="compact"
				onClick={ () => {
					toggleFilterValue( true );
				} }
			>
				{ sprintf(
					// translators: %(siteCount)d is the number of plugins with updates available.
					__( 'Update available (%(siteCount)d)' ),
					{ siteCount }
				) }
			</Button>
		</div>
	);
};
