import {
	__experimentalHStack as HStack,
	MenuGroup,
	NavigableMenu,
	SearchControl,
	VisuallyHidden,
} from '@wordpress/components';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useMemo, type JSX, type PropsWithChildren } from 'react';
import RouterLinkMenuItem from '../router-link-menu-item';
import { Text } from '../text';
import { SwitcherItemSkeleton } from './switcher-item';
import { RenderItem, SwitcherLoadingState } from './types';
import type { View, Field } from '@wordpress/dataviews';

import './switcher-content.scss';

// Only used when the view doesn't paginate.
const FALLBACK_MAX_ITEM_COUNT = 10;
// Cycling the widths keeps the placeholder rows from reading as repeated
// content. They stay short enough to fit, so the rows differ from each other
// rather than all ending at the same truncation point.
const LOADING_TITLE_LENGTHS = [ 16, 11, 14, 12, 15, 10 ];

/**
 * How many placeholder rows to show while the items load. The page size is the
 * cap so the placeholder list is as tall as the list that replaces it.
 */
export function getPlaceholderCount( itemCount: number, perPage?: number ) {
	return Math.min( Math.max( itemCount, 1 ), perPage ?? FALLBACK_MAX_ITEM_COUNT );
}

export default function SwitcherContent< T >( {
	itemClassName,
	items,
	searchableFields,
	searchClassName = 'switcher-content__search',
	view,
	onChangeView,
	width = '280px',
	getItemUrl,
	renderItem,
	loading,
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
	loading: SwitcherLoadingState;
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

	const { data: filteredData } = filterSortAndPaginate( items ?? [], view, fields );

	// The search field is rendered even while loading: `Popover`'s focus-on-mount
	// only moves focus into the popover if it finds something tabbable there, and
	// without focus inside, neither click-outside nor Escape can dismiss it.
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

	const renderMenuItems = () => {
		if ( ! items ) {
			const count = getPlaceholderCount( loading.itemCount, view.perPage );
			return (
				<div className="switcher-content__loading">
					<VisuallyHidden role="status">{ __( 'Loading…' ) }</VisuallyHidden>
					{ Array.from( { length: count }, ( _, index ) => (
						// Placeholders reuse the real row's chrome so they share its padding,
						// height and truncation, and the popover doesn't resize once loaded.
						<div
							className="switcher-content__loading-item"
							key={ index }
							style={ { height: 'fit-content', minHeight: '40px' } }
							aria-hidden="true"
						>
							<SwitcherItemSkeleton
								hasMedia={ loading.hasMedia }
								hasDescription={ loading.hasDescription }
								mediaSize={ loading.mediaSize }
								spacing={ loading.spacing }
								titleLength={ LOADING_TITLE_LENGTHS[ index % LOADING_TITLE_LENGTHS.length ] }
							/>
						</div>
					) ) }
				</div>
			);
		}

		if ( filteredData.length === 0 ) {
			return (
				<Text variant="muted" className="switcher-content__no-results">
					{ noResultsText }
				</Text>
			);
		}

		return filteredData.map( ( item ) => {
			const itemUrl = getItemUrl( item );
			const className = typeof itemClassName === 'function' ? itemClassName( item ) : itemClassName;
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
		} );
	};

	return (
		<NavigableMenu style={ { width } }>
			{ filter ? (
				<HStack justify="flex-start">
					{ search }
					{ filter }
				</HStack>
			) : (
				search
			) }
			<MenuGroup hideSeparator>{ renderMenuItems() }</MenuGroup>
			{ children }
		</NavigableMenu>
	);
}
