/**
 * External dependencies
 */
import type { ReactNode, ComponentProps, ReactElement } from 'react';

/**
 * WordPress dependencies
 */
import { __experimentalHStack as HStack } from '@wordpress/components';
import { useContext, useMemo, useRef, useState } from '@wordpress/element';
import { useMergeRefs, useResizeObserver } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import DataViewsContext from '../dataviews-context';
import {
	default as DataViewsFilters,
	useFilters,
	FiltersToggle,
} from '../dataviews-filters';
import DataViewsLayout from '../dataviews-layout';
import DataViewsFooter from '../dataviews-footer';
import DataViewsSearch from '../dataviews-search';
import { BulkActionsFooter } from '../dataviews-bulk-actions';
import { DataViewsPagination } from '../dataviews-pagination';
import DataViewsViewConfig, {
	DataviewsViewConfigDropdown,
	ViewTypeMenu,
} from '../dataviews-view-config';
import { normalizeFields } from '../../normalize-fields';
import type { Action, Field, View, SupportedLayouts } from '../../types';
import type { SelectionOrUpdater } from '../../private-types';
type ItemWithId = { id: string };

type DataViewsProps< Item > = {
	view: View;
	onChangeView: ( view: View ) => void;
	fields: Field< Item >[];
	search?: boolean;
	searchLabel?: string;
	actions?: Action< Item >[];
	data: Item[];
	isLoading?: boolean;
	paginationInfo: {
		totalItems: number;
		totalPages: number;
	};
	defaultLayouts: SupportedLayouts;
	selection?: string[];
	onChangeSelection?: ( items: string[] ) => void;
	onClickItem?: ( item: Item ) => void;
	renderItemLink?: (
		props: {
			item: Item;
		} & ComponentProps< 'a' >
	) => ReactElement;
	isItemClickable?: ( item: Item ) => boolean;
	header?: ReactNode;
	getItemLevel?: ( item: Item ) => number;
	children?: ReactNode;
} & ( Item extends ItemWithId
	? { getItemId?: ( item: Item ) => string }
	: { getItemId: ( item: Item ) => string } );

const defaultGetItemId = ( item: ItemWithId ) => item.id;
const defaultIsItemClickable = () => true;
const EMPTY_ARRAY: any[] = [];

type DefaultUIProps = Pick<
	DataViewsProps< any >,
	'header' | 'search' | 'searchLabel'
>;

function DefaultUI( {
	header,
	search = true,
	searchLabel = undefined,
}: DefaultUIProps ) {
	const { isShowingFilter } = useContext( DataViewsContext );
	return (
		<>
			<HStack
				alignment="top"
				justify="space-between"
				className="dataviews__view-actions"
				spacing={ 1 }
			>
				<HStack
					justify="start"
					expanded={ false }
					className="dataviews__search"
				>
					{ search && <DataViewsSearch label={ searchLabel } /> }
					<FiltersToggle />
				</HStack>
				<HStack
					spacing={ 1 }
					expanded={ false }
					style={ { flexShrink: 0 } }
				>
					<DataViewsViewConfig />
					{ header }
				</HStack>
			</HStack>
			{ isShowingFilter && (
				<DataViewsFilters className="dataviews-filters__container" />
			) }
			<DataViewsLayout />
			<DataViewsFooter />
		</>
	);
}

function DataViews< Item >( {
	view,
	onChangeView,
	fields,
	search = true,
	searchLabel = undefined,
	actions = EMPTY_ARRAY,
	data,
	getItemId = defaultGetItemId,
	getItemLevel,
	isLoading = false,
	paginationInfo,
	defaultLayouts,
	selection: selectionProperty,
	onChangeSelection,
	onClickItem,
	renderItemLink,
	isItemClickable = defaultIsItemClickable,
	header,
	children,
}: DataViewsProps< Item > ) {
	const containerRef = useRef< HTMLDivElement | null >( null );
	const [ containerWidth, setContainerWidth ] = useState( 0 );
	const resizeObserverRef = useResizeObserver(
		( resizeObserverEntries: any ) => {
			setContainerWidth(
				resizeObserverEntries[ 0 ].borderBoxSize[ 0 ].inlineSize
			);
		},
		{ box: 'border-box' }
	);
	const [ selectionState, setSelectionState ] = useState< string[] >( [] );
	const isUncontrolled =
		selectionProperty === undefined || onChangeSelection === undefined;
	const selection = isUncontrolled ? selectionState : selectionProperty;
	const [ openedFilter, setOpenedFilter ] = useState< string | null >( null );
	function setSelectionWithChange( value: SelectionOrUpdater ) {
		const newValue =
			typeof value === 'function' ? value( selection ) : value;
		if ( isUncontrolled ) {
			setSelectionState( newValue );
		}
		if ( onChangeSelection ) {
			onChangeSelection( newValue );
		}
	}
	const _fields = useMemo( () => normalizeFields( fields ), [ fields ] );
	const _selection = useMemo( () => {
		return selection.filter( ( id ) =>
			data.some( ( item ) => getItemId( item ) === id )
		);
	}, [ selection, data, getItemId ] );

	const filters = useFilters( _fields, view );
	const [ isShowingFilter, setIsShowingFilter ] = useState< boolean >( () =>
		( filters || [] ).some( ( filter ) => filter.isPrimary )
	);

	return (
		<DataViewsContext.Provider
			value={ {
				view,
				onChangeView,
				fields: _fields,
				actions,
				data,
				isLoading,
				paginationInfo,
				selection: _selection,
				onChangeSelection: setSelectionWithChange,
				openedFilter,
				setOpenedFilter,
				getItemId,
				getItemLevel,
				isItemClickable,
				onClickItem,
				renderItemLink,
				containerWidth,
				containerRef,
				defaultLayouts,
				filters,
				isShowingFilter,
				setIsShowingFilter,
			} }
		>
			<div
				className="dataviews-wrapper"
				ref={ useMergeRefs( [ containerRef, resizeObserverRef ] ) }
			>
				{ children ?? (
					<DefaultUI
						header={ header }
						search={ search }
						searchLabel={ searchLabel }
					/>
				) }
			</div>
		</DataViewsContext.Provider>
	);
}

// Populate the DataViews sub components
const DataViewsSubComponents = DataViews as typeof DataViews & {
	BulkActionToolbar: typeof BulkActionsFooter;
	Filters: typeof DataViewsFilters;
	FiltersToggle: typeof FiltersToggle;
	Layout: typeof DataViewsLayout;
	LayoutSwitcher: typeof ViewTypeMenu;
	Pagination: typeof DataViewsPagination;
	Search: typeof DataViewsSearch;
	ViewConfig: typeof DataviewsViewConfigDropdown;
};

DataViewsSubComponents.BulkActionToolbar = BulkActionsFooter;
DataViewsSubComponents.Filters = DataViewsFilters;
DataViewsSubComponents.FiltersToggle = FiltersToggle;
DataViewsSubComponents.Layout = DataViewsLayout;
DataViewsSubComponents.LayoutSwitcher = ViewTypeMenu;
DataViewsSubComponents.Pagination = DataViewsPagination;
DataViewsSubComponents.Search = DataViewsSearch;
DataViewsSubComponents.ViewConfig = DataviewsViewConfigDropdown;

export default DataViewsSubComponents;
