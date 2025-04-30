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
import type { SupportedLayouts, Field, View, Action } from '../../types';

type ItemWithId = { id: string };

type DataViewsContainerProps< Item > = {
	data: Item[];
	children: ReactNode;

	view?: View;
	onChangeView?: ( view: View ) => void;
	fields?: Field< Item >[];
	search?: boolean;
	searchLabel?: string;
	actions?: Action< Item >[];
	isLoading?: boolean;
	paginationInfo?: {
		totalItems: number;
		totalPages: number;
	};
	defaultLayouts?: SupportedLayouts;
	selection?: string[];
	onChangeSelection?: ( items: string[] ) => void;
	onClickItem?: ( item: Item ) => void;
	isItemClickable?: ( item: Item ) => boolean;
	header?: ReactNode;
	getItemLevel?: ( item: Item ) => number;
} & ( Item extends ItemWithId
	? { getItemId?: ( item: Item ) => string }
	: { getItemId: ( item: Item ) => string } );

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
