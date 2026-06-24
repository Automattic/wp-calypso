import {
	__experimentalHStack as HStack,
	MenuGroup,
	NavigableMenu,
	SearchControl,
} from '@wordpress/components';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useMemo, type JSX, type PropsWithChildren } from 'react';
import RouterLinkMenuItem from '../router-link-menu-item';
import { Text } from '../text';
import { RenderItem } from './types';
import type { View, Field } from '@wordpress/dataviews';

import './switcher-content.scss';

export default function SwitcherContent< T >( {
	itemClassName,
	items,
	searchableFields,
	searchClassName,
	view,
	onChangeView,
	width = '280px',
	getItemUrl,
	renderItem,
	resetScroll = true,
	children,
	onClose,
	onItemClick,
	filter,
	filterField,
	noResultsText = __( 'No results found.' ),
}: PropsWithChildren< {
	itemClassName?: string | ( ( item: T ) => string );
	items?: T[];
	searchClassName?: string;
	searchableFields: Field< T >[];
	view: View;
	onChangeView: ( newView: View ) => void;
	width?: string;
	getItemUrl: ( item: T ) => string;
	renderItem: RenderItem< T >;
	resetScroll?: boolean;
	onClose: () => void;
	onItemClick?: () => void;
	filter?: JSX.Element;
	filterField?: Field< T >;
	noResultsText?: string;
} > ) {
	const fields = useMemo( () => {
		const allFields = searchableFields.map( ( searchableField ) => ( {
			...searchableField,
			enableGlobalSearch: true,
		} ) );

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

	const search = (
		<SearchControl
			className={ searchClassName }
			label={ __( 'Search' ) }
			value={ view.search }
			onChange={ ( value ) => onChangeView( { ...view, search: value } ) }
			size="compact"
			__nextHasNoMarginBottom
		/>
	);

	return (
		<NavigableMenu style={ { width } }>
			<MenuGroup>
				{ filter ? (
					<HStack justify="flex-start">
						{ search }
						{ filter }
					</HStack>
				) : (
					search
				) }
			</MenuGroup>
			<MenuGroup hideSeparator>
				{ filteredData.length === 0 ? (
					<Text variant="muted" className="switcher-content__no-results">
						{ noResultsText }
					</Text>
				) : (
					filteredData.map( ( item ) => {
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
								{ renderItem( { item, context: 'list' } ) }
							</RouterLinkMenuItem>
						);
					} )
				) }
			</MenuGroup>
			{ children }
		</NavigableMenu>
	);
}
