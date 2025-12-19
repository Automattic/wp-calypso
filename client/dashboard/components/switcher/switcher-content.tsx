import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
	MenuGroup,
	NavigableMenu,
	SearchControl,
} from '@wordpress/components';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { funnel } from '@wordpress/icons';
import { useMemo } from 'react';
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

	const hasActiveFilter =
		filterField && view.filters?.some( ( f ) => f.field === filterField.id && f.value === true );

	const toggleFilter = () => {
		if ( ! filterField ) {
			return;
		}

		if ( hasActiveFilter ) {
			// Remove the filter
			onChangeView( {
				...view,
				filters: view.filters?.filter( ( f ) => f.field !== filterField.id ) || [],
			} );
		} else {
			// Add the filter
			onChangeView( {
				...view,
				filters: [
					...( view.filters || [] ),
					{
						field: filterField.id,
						operator: 'is' as const,
						value: true,
					},
				],
			} );
		}
	};

	return (
		<NavigableMenu style={ { width } }>
			<MenuGroup>
				<HStack justify="space-between" alignment="center">
					<SearchControl
						className={ searchClassName }
						label={ __( 'Search' ) }
						value={ view.search }
						onChange={ ( value ) => onChangeView( { ...view, search: value } ) }
						size="compact"
						__nextHasNoMarginBottom
					/>
					{ filterField && (
						<Button
							className="dataviews-filters__visibility-toggle"
							size="compact"
							icon={ funnel }
							onClick={ toggleFilter }
						/>
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
