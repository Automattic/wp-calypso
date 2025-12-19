import {
	__experimentalVStack as VStack,
	Button,
	Popover,
	CheckboxControl,
} from '@wordpress/components';
import { funnel } from '@wordpress/icons';
import { useState, useRef } from 'react';
import { PluginListRow } from '../types';
import type { View, Field } from '@wordpress/dataviews';

export const PluginUpdatesFilter = ( {
	updatesField,
	view,
	onChangeView,
}: {
	updatesField: Field< PluginListRow >;
	view: View;
	onChangeView: ( newView: View ) => void;
} ) => {
	const [ isPopoverOpen, setIsPopoverOpen ] = useState( false );
	const filterButtonRef = useRef< HTMLButtonElement >( null );

	const toggleFilterValue = ( value: boolean | string | number ) => {
		if ( ! updatesField ) {
			return;
		}

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
				ref={ filterButtonRef }
				className="dataviews-filters__visibility-toggle"
				size="compact"
				icon={ funnel }
				onClick={ () => setIsPopoverOpen( ! isPopoverOpen ) }
				aria-expanded={ isPopoverOpen }
				isPressed={ isPopoverOpen }
			/>
			{ view.filters && view.filters.length > 0 && (
				<span className="dataviews-filters-toggle__count">{ view.filters.length }</span>
			) }
			{ isPopoverOpen && (
				<Popover
					anchor={ filterButtonRef.current }
					onClose={ () => setIsPopoverOpen( false ) }
					placement="bottom-end"
				>
					<VStack spacing={ 2 } style={ { padding: '16px', minWidth: '200px' } }>
						{ updatesField.elements?.map( ( element ) => {
							const currentFilter = view.filters?.find( ( f ) => f.field === updatesField.id );
							const isChecked = currentFilter?.value === element.value;

							return (
								<CheckboxControl
									key={ String( element.value ) }
									label={ element.label }
									checked={ isChecked }
									onChange={ () => {
										toggleFilterValue( element.value );
										setIsPopoverOpen( ! isPopoverOpen );
									} }
								/>
							);
						} ) }
					</VStack>
				</Popover>
			) }
		</div>
	);
};
