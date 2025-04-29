/**
 * External dependencies
 */
import type { ReactNode } from 'react';

/**
 * WordPress dependencies
 */
import { createElement } from '@wordpress/element';

/**
 * Internal dependencies
 */
import DataViewsContext, { type DataViewsContextType } from '../dataviews-context';
import type { DataViewsProps } from '../dataviews';
import { LAYOUT_TABLE } from '../../constants';


/**
 * Default value for DataViewsContext.
 */
export const DEFAULT_DATAVIEWS_CONTEXT_VALUE: DataViewsContextType< any > = {
	view: { type: LAYOUT_TABLE },
	onChangeView: () => {},
	fields: [],
	data: [],
	isLoading: false,
	paginationInfo: {
		totalItems: 0,
		totalPages: 0,
	},
	selection: [],
	onChangeSelection: () => {},
	openedFilter: null,
	setOpenedFilter: () => {},
	getItemId: ( item ) => item.id,
	getItemLevel: undefined,
	onClickItem: undefined,
	isItemClickable: () => true,
	containerWidth: 0,
};

/**
 * DataViewsProviderProps:
 * Requires `data` and `children`. All other props from DataViewsProps are optional,
 * except for `header`, `search`, and `searchLabel`, which are intentionally omitted.
 */
type DataViewsProviderProps< Item > = Pick< DataViewsProps< Item >, 'data' > &
	Partial<
		Omit<
			DataViewsProps< Item >,
			'header' | 'search' | 'searchLabel' | 'data'
		>
	> & {
		children: ReactNode;
	};

const DataViewsProvider = < Item, >( {
	data,
	children,
	...contextProps
}: DataViewsProviderProps< Item > ) => {
	const contextValue = {
		...DEFAULT_DATAVIEWS_CONTEXT_VALUE,
		...contextProps,
		data,
	};

	return (
		<DataViewsContext.Provider value={ contextValue }>
			{ children }
		</DataViewsContext.Provider>
	);
};

export default DataViewsProvider;
