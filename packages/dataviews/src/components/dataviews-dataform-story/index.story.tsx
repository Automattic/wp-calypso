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
		<HStack spacing={ 4 } alignment="stretch" style={ { height: '80vh' } }>
			<div style={ { flex: 2, minWidth: 0 } }>
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
					onClickItem={ ( item ) => {
						alert( 'clicked: ' + item.title );
					} }
				/>
			</div>
			<div
				style={ {
					flex: 1,
					minWidth: 320,
					maxWidth: 400,
					background: '#fafbfc',
					borderLeft: '1px solid #e0e0e0',
					padding: 24,
				} }
			>
				{ selectedItem ? (
					<Card>
						<CardHeader>
							<strong>{ selectedItem.title }</strong>
						</CardHeader>
						<CardBody>
							<DataForm< SpaceObject >
								data={ selectedItem }
								fields={ fields }
								form={ form }
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
						</CardBody>
					</Card>
				) : (
					<VStack
						alignment="center"
						justify="center"
						style={ { height: '100%' } }
					>
						<span style={ { color: '#888' } }>
							Select an item to view details
						</span>
					</VStack>
				) }
			</div>
		</HStack>
	);
};
