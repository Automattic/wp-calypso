/**
 * External dependencies
 */
import type { ReactNode } from 'react';

/**
 * Internal dependencies
 */
import DataViewsContext, { type DataViewsContextType } from '../dataviews-context';
import type { DataViewsProps } from '../dataviews';
import { LAYOUT_TABLE } from '../../constants';
import { SupportedLayouts, Field, View } from '../../types';

type DataViewsContainerProps< Item > = Omit<
	DataViewsProps< Item >,
	| 'header'
	| 'view'
	| 'fields'
	| 'paginationInfo'
	| 'onChangeView'
	| 'defaultLayouts'
> & {
	children: ReactNode;
	view?: View;
	fields?: Field< Item >[];
	paginationInfo?: {
		totalItems: number;
		totalPages: number;
	};
	defaultLayouts?: SupportedLayouts;
	onChangeView?: ( view: View ) => void;
};

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

const DataViewsContainer = < Item, >( {
	data,
	children,
	...contextProps
}: DataViewsContainerProps< Item > ) => {
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

export default DataViewsContainer;
