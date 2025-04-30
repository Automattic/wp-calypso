/**
 * External dependencies
 */
import type { ReactNode } from 'react';

/**
 * Internal dependencies
 */
import DataViewsContext, {
	type DataViewsContextType,
} from '../dataviews-context';
import { LAYOUT_TABLE } from '../../constants';
import type { DataViewsProps } from '../dataviews';

type DataViewsContainerProps< Item > = Partial< DataViewsProps< Item > > & {
	data: Item[];
	children: ReactNode;
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
