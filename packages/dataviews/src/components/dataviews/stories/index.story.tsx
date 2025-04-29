/**
 * WordPress dependencies
 */
import { useState, useMemo } from '@wordpress/element';

/**
 * Internal dependencies
 */
import DataViews from '../index';
import { DEFAULT_VIEW, actions, data, fields } from './fixtures';
import { LAYOUT_GRID, LAYOUT_LIST, LAYOUT_TABLE } from '../../../constants';
import { filterSortAndPaginate } from '../../../filter-and-sort-data-view';
import type { View } from '../../../types';

import './style.css';

const meta = {
	title: 'DataViews/DataViews',
	component: DataViews,
};
export default meta;

const defaultLayouts = {
	[ LAYOUT_TABLE ]: {},
	[ LAYOUT_GRID ]: {},
	[ LAYOUT_LIST ]: {},
};

export const Default = () => {
	const [ view, setView ] = useState< View >( {
		...DEFAULT_VIEW,
		fields: [ 'categories' ],
		titleField: 'title',
		descriptionField: 'description',
		mediaField: 'image',
	} );
	const { data: shownData, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( data, view, fields );
	}, [ view ] );
	return (
		<DataViews
			getItemId={ ( item ) => item.id.toString() }
			paginationInfo={ paginationInfo }
			data={ shownData }
			view={ view }
			fields={ fields }
			onChangeView={ setView }
			actions={ actions }
			onClickItem={ ( item ) => {
				// eslint-disable-next-line no-alert
				alert( 'Clicked: ' + item.title );
			} }
			isItemClickable={ () => true }
			defaultLayouts={ defaultLayouts }
		/>
	);
};

export const Empty = () => {
	const [ view, setView ] = useState< View >( {
		...DEFAULT_VIEW,
		fields: [ 'title', 'description', 'categories' ],
	} );

	return (
		<DataViews
			getItemId={ ( item ) => item.id.toString() }
			paginationInfo={ { totalItems: 0, totalPages: 0 } }
			data={ [] }
			view={ view }
			fields={ fields }
			onChangeView={ setView }
			actions={ actions }
			defaultLayouts={ defaultLayouts }
		/>
	);
};

export const FieldsNoSortableNoHidable = () => {
	const [ view, setView ] = useState< View >( {
		...DEFAULT_VIEW,
		fields: [ 'title', 'description', 'categories' ],
	} );
	const { data: shownData, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( data, view, fields );
	}, [ view ] );

	const _fields = fields.map( ( field ) => ( {
		...field,
		enableSorting: false,
		enableHiding: false,
	} ) );

	return (
		<DataViews
			getItemId={ ( item ) => item.id.toString() }
			paginationInfo={ paginationInfo }
			data={ shownData }
			view={ view }
			fields={ _fields }
			onChangeView={ setView }
			defaultLayouts={ {
				table: {},
			} }
		/>
	);
};
