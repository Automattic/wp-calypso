import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	MenuGroup,
	NavigableMenu,
	SearchControl,
} from '@wordpress/components';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
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
} > ) {
	const fields = useMemo( () => {
		return searchableFields.map( ( searchableField ) => ( {
			...searchableField,
			enableGlobalSearch: true,
		} ) );
	}, [ searchableFields ] );

	if ( ! items ) {
		return __( 'Loading…' );
	}

	const { data: filteredData } = filterSortAndPaginate( items, view, fields );

	return (
		<NavigableMenu style={ { width } }>
			<MenuGroup>
				<SearchControl
					className={ searchClassName }
					label={ __( 'Search' ) }
					value={ view.search }
					onChange={ ( value ) => onChangeView( { ...view, search: value } ) }
					size="compact"
					__nextHasNoMarginBottom
				/>
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
