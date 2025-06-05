/**
 * External dependencies
 */
import type { ComponentProps, ReactElement } from 'react';

/**
 * WordPress dependencies
 */
import { createContext, createRef } from '@wordpress/element';

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
	renderItemLink?: (
		props: {
			item: Item;
		} & ComponentProps< 'a' >
	) => ReactElement;
	isItemClickable: ( item: Item ) => boolean;
	containerWidth: number;
	containerRef: React.MutableRefObject< HTMLDivElement | null >;
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
	renderItemLink: undefined,
	containerWidth: 0,
	containerRef: createRef(),
	defaultLayouts: { list: {}, grid: {}, table: {} },
	filters: [],
	isShowingFilter: false,
	setIsShowingFilter: () => {},
} );

export default DataViewsContext;
