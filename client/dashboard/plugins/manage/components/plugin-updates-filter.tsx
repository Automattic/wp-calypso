import { __experimentalHStack as HStack, Button, Icon, Tooltip } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { closeSmall } from '@wordpress/icons';
import { Text } from '../../../components/text';
import { PluginListRow } from '../types';
import type { View, Field } from '@wordpress/dataviews';

import './plugin-updates-filter.scss';

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
	const currentFilter = view.filters?.find( ( f ) => f.field === updatesField.id );

	const toggleFilterValue = ( value: boolean ) => {
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

	const label = sprintf(
		// translators: %(siteCount)d is the number of plugins with updates available.
		__( 'Update available (%(siteCount)d)' ),
		{ siteCount }
	);

	return currentFilter?.value === true ? (
		<div className="plugin-switcher__updates-filter-wrapper dataviews-filters__summary-chip-container">
			<Tooltip text={ __( 'Remove' ) } placement="top">
				{ /* eslint-disable-next-line jsx-a11y/click-events-have-key-events */ }
				<HStack
					className="dataviews-filters__summary-chip has-reset"
					spacing={ 1 }
					role="button"
					aria-pressed="false"
					aria-expanded="false"
					tabIndex={ 0 }
					onClick={ () => toggleFilterValue( false ) }
				>
					<Text className="plugin-switcher__updates-filter-active-label">{ label }</Text>

					<button
						className="plugin-switcher__updates-filter-remove"
						onClick={ () => toggleFilterValue( false ) }
					>
						<Icon icon={ closeSmall } />
					</button>
				</HStack>
			</Tooltip>
		</div>
	) : (
		<div className="plugin-switcher__updates-filter-wrapper">
			<Button
				className="plugin-switcher__updates-filter"
				size="compact"
				onClick={ () => {
					toggleFilterValue( true );
				} }
			>
				{ label }
			</Button>
		</div>
	);
};
// dataviews-filters__summary-chip-remove
