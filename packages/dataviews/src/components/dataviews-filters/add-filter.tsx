/**
 * External dependencies
 */
import type { Ref } from 'react';

/**
 * WordPress dependencies
 */
import {
	privateApis as componentsPrivateApis,
	Button,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { forwardRef } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { unlock } from '../../lock-unlock';
import type { NormalizedFilter, View } from '../../types';

const { Menu } = unlock( componentsPrivateApis );

interface AddFilterProps {
	filters: NormalizedFilter[];
	view: View;
	onChangeView: ( view: View ) => void;
	setOpenedFilter: ( filter: string | null ) => void;
}

export function AddFilterMenu( {
	filters,
	view,
	onChangeView,
	setOpenedFilter,
	triggerProps,
}: AddFilterProps & {
	triggerProps: React.ComponentProps< typeof Menu.TriggerButton >;
} ) {
	const inactiveFilters = filters.filter( ( filter ) => ! filter.isVisible );
	return (
		<Menu>
			<Menu.TriggerButton { ...triggerProps } />
			<Menu.Popover>
				{ inactiveFilters.map( ( filter ) => {
					return (
						<Menu.Item
							key={ filter.field }
							onClick={ () => {
								setOpenedFilter( filter.field );
								onChangeView( {
									...view,
									page: 1,
									filters: [
										...( view.filters || [] ),
										{
											field: filter.field,
											value: undefined,
											operator: filter.operators[ 0 ],
										},
									],
								} );
							} }
						>
							<Menu.ItemLabel>{ filter.name }</Menu.ItemLabel>
						</Menu.Item>
					);
				} ) }
			</Menu.Popover>
		</Menu>
	);
}

function AddFilter(
	{ filters, view, onChangeView, setOpenedFilter }: AddFilterProps,
	ref: Ref< HTMLButtonElement >
) {
	if ( ! filters.length || filters.every( ( { isPrimary } ) => isPrimary ) ) {
		return null;
	}
	const inactiveFilters = filters.filter( ( filter ) => ! filter.isVisible );
	return (
		<AddFilterMenu
			triggerProps={ {
				render: (
					<Button
						accessibleWhenDisabled
						size="compact"
						className="dataviews-filters-button"
						variant="tertiary"
						disabled={ ! inactiveFilters.length }
						ref={ ref }
					/>
				),
				children: __( 'Add filter' ),
			} }
			{ ...{ filters, view, onChangeView, setOpenedFilter } }
		/>
	);
}

export default forwardRef( AddFilter );
