/**
 * WordPress dependencies
 */
import { createContext } from '@wordpress/element';

/**
 * Internal dependencies
 */
import type {
	View,
	Action,
	NormalizedField,
	SupportedLayouts,
	NormalizedFilter,
} from '../../types';
import type { SetSelection } from '../../private-types';
import { LAYOUT_TABLE } from '../../constants';

type DataViewsContextType< Item > = {
	view: View;
	onChangeView: ( view: View ) => void;
	fields: NormalizedField< Item >[];
	actions?: Action< Item >[];
	data: Item[];
	isLoading?: boolean;
	paginationInfo: {
		totalItems: number;
		totalPages: number;
	};
	selection: string[];
	onChangeSelection: SetSelection;
	openedFilter: string | null;
	setOpenedFilter: ( openedFilter: string | null ) => void;
	getItemId: ( item: Item ) => string;
	getItemLevel?: ( item: Item ) => number;
	onClickItem?: ( item: Item ) => void;
	isItemClickable: ( item: Item ) => boolean;
	containerWidth: number;
	defaultLayouts: SupportedLayouts;
	filters: NormalizedFilter[];
	isShowingFilter: boolean;
	setIsShowingFilter: ( value: boolean ) => void;
};

const DataViewsContext = createContext< DataViewsContextType< any > >( {
	view: { type: LAYOUT_TABLE },
	onChangeView: () => {},
	fields: [],
	data: [],
	paginationInfo: {
		totalItems: 0,
		totalPages: 0,
	},
	selection: [],
	onChangeSelection: () => {},
	setOpenedFilter: () => {},
	openedFilter: null,
	getItemId: ( item ) => item.id,
	isItemClickable: () => true,
	containerWidth: 0,
	defaultLayouts: { list: {}, grid: {}, table: {} },
	filters: [],
	isShowingFilter: false,
	setIsShowingFilter: () => {},
} );

export default DataViewsContext;
