import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
	MenuGroup,
	NavigableMenu,
	Popover,
	SearchControl,
	CheckboxControl,
} from '@wordpress/components';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { funnel } from '@wordpress/icons';
import { useMemo, useState, useRef } from 'react';
import RouterLinkMenuItem from '../router-link-menu-item';
import { RenderItemTitle, RenderItemMedia, RenderItemDescription } from './types';
import type { View, Field } from '@wordpress/dataviews';
import type { PropsWithChildren } from 'react';

export default function SwitcherContent< T >( {
	itemAlignment,
	itemClassName,
	itemSpacing,
	items,
	searchableFields,
	searchClassName,
	view,
	onChangeView,
	width = '280px',
	getItemUrl,
	renderItemMedia,
	renderItemTitle,
	renderItemDescription,
	resetScroll = true,
	children,
	onClose,
	onItemClick,
	filterField,
}: PropsWithChildren< {
	itemAlignment?: string;
	itemClassName?: string | ( ( item: T ) => string );
	itemSpacing?: number;
	items?: T[];
	searchClassName?: string;
	searchableFields: Field< T >[];
	view: View;
	onChangeView: ( newView: View ) => void;
	width?: string;
	getItemUrl: ( item: T ) => string;
	renderItemMedia: RenderItemMedia< T >;
	renderItemTitle: RenderItemTitle< T >;
	renderItemDescription?: RenderItemDescription< T >;
	resetScroll?: boolean;
	onClose: () => void;
	onItemClick?: () => void;
	filterField?: Field< T >;
} > ) {
	const [ isPopoverOpen, setIsPopoverOpen ] = useState( false );
	const filterButtonRef = useRef< HTMLButtonElement >( null );

	const fields = useMemo( () => {
		const allFields = searchableFields.map( ( searchableField ) => ( {
			...searchableField,
			enableGlobalSearch: true,
		} ) );

		// Add filter field if provided
		if ( filterField ) {
			allFields.push( {
				...filterField,
				enableGlobalSearch: false,
			} );
		}

		return allFields;
	}, [ searchableFields, filterField ] );

	if ( ! items ) {
		return __( 'Loading…' );
	}

	const { data: filteredData } = filterSortAndPaginate( items, view, fields );

	const toggleFilterValue = ( value: boolean | string | number ) => {
		if ( ! filterField ) {
			return;
		}

		const currentFilter = view.filters?.find( ( f ) => f.field === filterField.id );
		const isCurrentlySelected = currentFilter?.value === value;

		if ( isCurrentlySelected ) {
			// Remove the filter
			onChangeView( {
				...view,
				filters: view.filters?.filter( ( f ) => f.field !== filterField.id ) || [],
			} );
		} else {
			// Add or update the filter
			const otherFilters = view.filters?.filter( ( f ) => f.field !== filterField.id ) || [];
			onChangeView( {
				...view,
				filters: [
					...otherFilters,
					{
						field: filterField.id,
						operator: 'is' as const,
						value,
					},
				],
			} );
		}
	};

	return (
		<NavigableMenu style={ { width } }>
			<MenuGroup>
				<HStack justify="flex-start" alignment="center">
					<SearchControl
						className={ searchClassName }
						label={ __( 'Search' ) }
						value={ view.search }
						onChange={ ( value ) => onChangeView( { ...view, search: value } ) }
						size="compact"
						__nextHasNoMarginBottom
					/>
					{ filterField && (
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
										{ filterField.elements?.map( ( element ) => {
											const currentFilter = view.filters?.find(
												( f ) => f.field === filterField.id
											);
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
					) }
				</HStack>
			</MenuGroup>
			<MenuGroup hideSeparator>
				{ filteredData.map( ( item ) => {
					const itemUrl = getItemUrl( item );
					const className =
						typeof itemClassName === 'function' ? itemClassName( item ) : itemClassName;
					return (
						<RouterLinkMenuItem
							className={ className }
							key={ itemUrl }
							to={ itemUrl }
							style={ { height: 'fit-content', minHeight: '40px' } }
							onClick={ () => {
								onClose();
								onItemClick?.();
							} }
							resetScroll={ resetScroll }
						>
							<HStack
								justify="flex-start"
								alignment={ itemAlignment || 'center' }
								expanded
								{ ...( itemSpacing ? { spacing: itemSpacing } : {} ) }
							>
								{ renderItemMedia( { item, context: 'list', size: 32 } ) }
								<VStack spacing={ 0 }>
									{ renderItemTitle( { item, context: 'list' } ) }
									{ renderItemDescription?.( { item, context: 'list' } ) }
								</VStack>
							</HStack>
						</RouterLinkMenuItem>
					);
				} ) }
			</MenuGroup>
			{ children }
		</NavigableMenu>
	);
}
