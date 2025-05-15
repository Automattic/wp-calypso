/**
 * WordPress dependencies
 */
import { useState, useMemo } from '@wordpress/element';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Card,
	CardHeader,
	CardBody,
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import DataViews from '../dataviews/index';
import DataForm from '../dataform/index';
import {
	actions,
	data,
	fields,
	type SpaceObject,
} from '../dataviews/stories/fixtures';
import { filterSortAndPaginate } from '../../filter-and-sort-data-view';
import type { View, Form } from '../../types';

const meta = {
	title: 'DataViews/DataViewsAndDataForm',
	component: DataForm,
	argTypes: {
		type: {
			control: { type: 'select' },
			description:
				'Chooses the default layout of each field. "regular" is the default layout.',
			options: [ 'default', 'regular', 'panel' ],
		},
		labelPosition: {
			control: { type: 'select' },
			description: 'Chooses the label position of the layout.',
			options: [ 'default', 'top', 'side', 'none' ],
		},
	},
} as const;
export default meta;

const defaultLayouts = {
	table: {},
	grid: {},
	list: {},
};

export const Default = ( {
	type,
	labelPosition,
}: {
	type: 'default' | 'regular' | 'panel';
	labelPosition: 'default' | 'top' | 'side' | 'none';
} ) => {
	const form = useMemo(
		() => ( {
			type,
			labelPosition,
			fields: [
				'title',
				'description',
				'type',
				'isPlanet',
				'satellites',
				'date',
			],
		} ),
		[ type, labelPosition ]
	) as Form;

	const [ view, setView ] = useState< View >( {
		type: 'table' as const,
		search: '',
		page: 1,
		perPage: 10,
		layout: {},
		filters: [],
		titleField: 'title',
		descriptionField: 'description',
		mediaField: 'image',
		fields: [ 'type', 'isPlanet', 'satellites', 'categories', 'date' ],
	} );

	const [ selectedIds, setSelectedIds ] = useState< number[] >( [] );
	const [ modifiedData, setModifiedData ] = useState< SpaceObject[] >( data );

	const { data: shownData, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( modifiedData, view, fields );
	}, [ modifiedData, view ] );

	let selectedItem =
		( selectedIds.length === 1 &&
			shownData.find( ( item ) => item.id === selectedIds[ 0 ] ) ) ||
		null;

	return (
		<HStack alignment="stretch">
			<div style={ { flex: 2 } }>
				<DataViews
					getItemId={ ( item ) => item.id.toString() }
					data={ shownData }
					paginationInfo={ paginationInfo }
					view={ view }
					fields={ fields }
					onChangeView={ setView }
					actions={ actions }
					defaultLayouts={ defaultLayouts }
					selection={ selectedIds.map( ( id ) => id.toString() ) }
					onChangeSelection={ ( newSelection ) =>
						setSelectedIds(
							newSelection.map( ( id ) => parseInt( id, 10 ) )
						)
					}
					onClickItem={ ( item ) => alert( 'clicked ' + item.title ) }
				/>
			</div>
			{ selectedItem ? (
				<VStack alignment="top">
					<DataForm
						data={ selectedItem }
						form={ form }
						fields={ fields }
						onChange={ ( updatedValues ) => {
							const updatedItem = {
								...selectedItem,
								...updatedValues,
							};

							setModifiedData(
								modifiedData.map( ( item ) =>
									item.id === selectedItem.id
										? updatedItem
										: item
								)
							);
						} }
					/>
				</VStack>
			) : (
				<VStack alignment="center">
					<span
						style={ {
							color: '#888',
						} }
					>
						Please, select a single item.
					</span>
				</VStack>
			) }
		</HStack>
	);
};
