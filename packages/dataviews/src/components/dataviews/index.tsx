/**
 * External dependencies
 */
import type { ReactNode } from 'react';

/**
 * WordPress dependencies
 */
import { __experimentalHStack as HStack } from '@wordpress/components';
import { useMemo, useState } from '@wordpress/element';
import { useResizeObserver } from '@wordpress/compose';

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
import DataViewsViewConfig from '../dataviews-view-config';
import { normalizeFields } from '../../normalize-fields';
import type { Action, Field, View, SupportedLayouts } from '../../types';
import type { SelectionOrUpdater } from '../../private-types';

import type { DataViewsContextType } from '../dataviews-context';

/**
 * External public props
 */
type ItemWithId = { id: string };

export type DataViewsControlledProps< Item > = {
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
	isItemClickable?: ( item: Item ) => boolean;
	header?: ReactNode;
	getItemLevel?: ( item: Item ) => number;
} & ( Item extends ItemWithId
	? { getItemId?: ( item: Item ) => string }
	: { getItemId: ( item: Item ) => string } );

export type DataViewsCompositionProps< Item > = {
	children: ReactNode;
	data?: Item[];
} & Partial< Omit< DataViewsControlledProps< Item >, 'children' | 'data' > >;

export type DataViewsProps< Item > =
	| DataViewsControlledProps< Item >
	| DataViewsCompositionProps< Item >;

const defaultGetItemId = ( item: ItemWithId ) => item.id;
const defaultIsItemClickable = () => true;
const EMPTY_ARRAY: any[] = [];

export default function DataViews< Item >( props: DataViewsProps< Item > ) {
	const {
		view,
		onChangeView,
		fields = [],
		search = true,
		searchLabel = undefined,
		actions = EMPTY_ARRAY,
		data,
		selection: selectionProperty,
		onChangeSelection,
		paginationInfo,
		getItemId = defaultGetItemId,
		getItemLevel,
		isLoading = false,
		onClickItem,
		isItemClickable = defaultIsItemClickable,
		header,
		defaultLayouts,
		children,
	} = props as DataViewsControlledProps< Item > &
		DataViewsCompositionProps< Item >;

	const [ containerWidth, setContainerWidth ] = useState( 0 );
	const containerRef = useResizeObserver(
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
		return (
			selection?.filter(
				( id ) => data?.some( ( item ) => getItemId( item ) === id )
			) || []
		);
	}, [ selection, data, getItemId ] );

	const filters = useFilters( _fields, view ?? ( {} as View ) );
	const [ isShowingFilter, setIsShowingFilter ] = useState< boolean >( () =>
		( filters || [] ).some( ( filter ) => filter.isPrimary )
	);

	const contextValue: DataViewsContextType< Item > = {
		view: view as View,
		onChangeView: onChangeView as ( view: View ) => void,
		fields: _fields,
		actions,
		data: ( data || [] ) as Item[],
		isLoading,
		paginationInfo: paginationInfo || {
			totalItems: 0,
			totalPages: 0,
		},
		selection: _selection,
		onChangeSelection: setSelectionWithChange,
		openedFilter,
		setOpenedFilter,
		getItemId: getItemId as ( item: Item ) => string,
		getItemLevel,
		isItemClickable,
		onClickItem,
		containerWidth,
	};

	if ( children ) {
		return (
			<DataViewsContext.Provider
				value={ contextValue as DataViewsContextType< any > }
			>
				{ children }
			</DataViewsContext.Provider>
		);
	}

	if ( ! data ) {
		throw new Error( '`data` is required when `children` is not used.' );
	}

	return (
		<DataViewsContext.Provider value={ contextValue }>
			<div className="dataviews-wrapper" ref={ containerRef }>
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
						<FiltersToggle
							filters={ filters }
							view={ view! }
							onChangeView={ onChangeView! }
							setOpenedFilter={ setOpenedFilter }
							setIsShowingFilter={ setIsShowingFilter }
							isShowingFilter={ isShowingFilter }
						/>
					</HStack>
					<HStack
						spacing={ 1 }
						expanded={ false }
						style={ { flexShrink: 0 } }
					>
						<DataViewsViewConfig
							defaultLayouts={ defaultLayouts! }
						/>
						{ header }
					</HStack>
				</HStack>
				{ isShowingFilter && <DataViewsFilters /> }
				<DataViewsLayout />
				<DataViewsFooter />
			</div>
		</DataViewsContext.Provider>
	);
}
