/**
 * External dependencies
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/**
 * WordPress dependencies
 */
import { useMemo, useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import DataViews from '../components/dataviews';
import { LAYOUT_GRID, LAYOUT_LIST, LAYOUT_TABLE } from '../constants';
import type { Action, View } from '../types';
import { filterSortAndPaginate } from '../filter-and-sort-data-view';

type Data = {
	id: number;
	title: string;
	author?: number;
	order?: number;
};

const DEFAULT_VIEW = {
	type: 'table' as const,
	search: '',
	page: 1,
	perPage: 10,
	layout: {},
	filters: [],
};

const defaultLayouts = {
	[ LAYOUT_TABLE ]: {},
	[ LAYOUT_GRID ]: {},
	[ LAYOUT_LIST ]: {},
};

const fields = [
	{
		id: 'title',
		label: 'Title',
		type: 'text' as const,
	},
	{
		id: 'order',
		label: 'Order',
		type: 'integer' as const,
	},
	{
		id: 'author',
		label: 'Author',
		type: 'integer' as const,
		elements: [
			{ value: 1, label: 'Jane' },
			{ value: 2, label: 'John' },
		],
	},
	{
		label: 'Image',
		id: 'image',
		render: ( { item }: { item: Data } ) => {
			return (
				<svg
					width="400"
					height="180"
					data-testid={ 'image-field-' + item.id }
				>
					<rect
						x="50"
						y="20"
						rx="20"
						ry="20"
						width="150"
						height="150"
						style={ { fill: 'red', opacity: 0.5 } }
					/>
				</svg>
			);
		},
		enableSorting: false,
	},
];

const actions: Action< Data >[] = [
	{
		id: 'delete',
		label: 'Delete',
		isDestructive: true,
		supportsBulk: true,
		RenderModal: () => <div>Modal Content</div>,
	},
];

const data: Data[] = [
	{
		id: 1,
		title: 'Hello World',
		author: 1,
		order: 1,
	},
	{
		id: 2,
		title: 'Homepage',
		author: 2,
		order: 1,
	},
	{
		id: 3,
		title: 'Posts',
		author: 2,
		order: 1,
	},
];

function DataViewWrapper( {
	view: additionalView,
	...props
}: Partial< Parameters< typeof DataViews< Data > >[ 0 ] > ) {
	const [ view, setView ] = useState< View >( {
		...DEFAULT_VIEW,
		fields: [ 'title', 'order', 'author' ],
		...additionalView,
	} );

	const { data: shownData, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( data, view, props.fields || fields );
	}, [ view, props.fields ] );

	const dataViewProps = {
		getItemId: ( item: Data ) => item.id.toString(),
		paginationInfo,
		data: shownData,
		view,
		fields,
		onChangeView: setView,
		actions: [],
		defaultLayouts,
		...props,
	};

	return <DataViews { ...dataViewProps } />;
}

// jest.useFakeTimers();

describe( 'DataViews component', () => {
	it( 'should show "No results" if data is empty', () => {
		render( <DataViewWrapper data={ [] } /> );
		expect( screen.getByText( 'No results' ) ).toBeInTheDocument();
	} );

	it( 'should filter results by "search" text, if field has enableGlobalSearch set to true', async () => {
		const fieldsWithSearch = [
			{
				...fields[ 0 ],
				enableGlobalSearch: true,
			},
			fields[ 1 ],
		];
		render(
			<DataViewWrapper
				fields={ fieldsWithSearch }
				view={ { ...DEFAULT_VIEW, search: 'Hello' } }
			/>
		);
		// Row count includes header.
		expect( screen.getAllByRole( 'row' ).length ).toEqual( 2 );
		expect( screen.getByText( 'Hello World' ) ).toBeInTheDocument();
	} );

	it( 'should display matched element label if field contains elements list', () => {
		render(
			<DataViewWrapper
				data={ [ { id: 1, author: 3, title: 'Hello World' } ] }
				fields={ [
					{
						id: 'author',
						label: 'Author',
						type: 'integer' as const,
						elements: [
							{ value: 1, label: 'Jane' },
							{ value: 2, label: 'John' },
							{ value: 3, label: 'Tim' },
						],
					},
				] }
			/>
		);
		expect( screen.getByText( 'Tim' ) ).toBeInTheDocument();
	} );

	it( 'should render custom render function if defined in field definition', () => {
		render(
			<DataViewWrapper
				data={ [ { id: 1, title: 'Test Title' } ] }
				fields={ [
					{
						id: 'title',
						label: 'Title',
						type: 'text' as const,
						render: ( { item }: { item: Data } ) => {
							return item.title?.toUpperCase();
						},
					},
				] }
			/>
		);
		expect( screen.getByText( 'TEST TITLE' ) ).toBeInTheDocument();
	} );

	describe( 'in table view', () => {
		it( 'should display columns for each field', () => {
			render( <DataViewWrapper /> );
			const displayedColumnFields = fields.filter( ( field ) =>
				[ 'title', 'order', 'author' ].includes( field.id )
			);
			for ( const field of displayedColumnFields ) {
				expect(
					screen.getByRole( 'button', { name: field.label } )
				).toBeInTheDocument();
			}
		} );

		it( 'should display the passed in data', () => {
			render( <DataViewWrapper /> );
			for ( const item of data ) {
				expect(
					screen.getAllByText( item.title )[ 0 ]
				).toBeInTheDocument();
			}
		} );

		it( 'should display title column if defined using titleField', () => {
			render(
				<DataViewWrapper
					view={ {
						...DEFAULT_VIEW,
						fields: [ 'order', 'author' ],
						titleField: 'title',
					} }
				/>
			);
			for ( const item of data ) {
				expect(
					screen.getAllByText( item.title )[ 0 ]
				).toBeInTheDocument();
			}
		} );

		it( 'should render actions column if actions are supported and passed in', () => {
			render( <DataViewWrapper actions={ actions } /> );
			expect( screen.getByText( 'Actions' ) ).toBeInTheDocument();
		} );

		it( 'should trigger the onClickItem callback if isItemClickable returns true and title field is clicked', async () => {
			const onClickItemCallback = jest.fn();

			render(
				<DataViewWrapper
					view={ {
						...DEFAULT_VIEW,
						fields: [ 'author' ],
						titleField: 'title',
					} }
					actions={ actions }
					isItemClickable={ () => true }
					onClickItem={ onClickItemCallback }
				/>
			);
			const titleField = screen.getByText( data[ 0 ].title );
			const user = userEvent.setup();
			await user.click( titleField );
			expect( onClickItemCallback ).toHaveBeenCalledWith( data[ 0 ] );
		} );
	} );

	describe( 'in grid view', () => {
		it( 'should display the passed in data', () => {
			render(
				<DataViewWrapper
					view={ {
						type: 'grid',
					} }
				/>
			);
			for ( const item of data ) {
				expect(
					screen.getAllByText( item.title )[ 0 ]
				).toBeInTheDocument();
			}
		} );

		it( 'should render mediaField if defined', () => {
			render(
				<DataViewWrapper
					view={ {
						type: 'grid',
						mediaField: 'image',
					} }
				/>
			);
			for ( const item of data ) {
				expect(
					screen.getByTestId( 'image-field-' + item.id )
				).toBeInTheDocument();
			}
		} );

		it( 'should render actions dropdown if actions are supported and passed in for each grid item', () => {
			render(
				<DataViewWrapper
					view={ {
						type: 'grid',
					} }
					actions={ actions }
				/>
			);
			expect(
				screen.getAllByRole( 'button', { name: 'Actions' } ).length
			).toEqual( 3 );
		} );

		it( 'should trigger the onClickItem callback if isItemClickable returns true and a media field is clicked', async () => {
			const mediaClickItemCallback = jest.fn();

			render(
				<DataViewWrapper
					view={ {
						type: 'grid',
						mediaField: 'image',
					} }
					actions={ actions }
					isItemClickable={ () => true }
					onClickItem={ mediaClickItemCallback }
				/>
			);
			const imageField = screen.getByTestId(
				'image-field-' + data[ 0 ].id
			);
			const user = userEvent.setup();
			await user.click( imageField );
			expect( mediaClickItemCallback ).toHaveBeenCalledWith( data[ 0 ] );
		} );
	} );

	describe( 'in list view', () => {
		it( 'should display the passed in data', () => {
			render(
				<DataViewWrapper
					view={ {
						type: 'list',
					} }
				/>
			);
			for ( const item of data ) {
				expect(
					screen.getAllByText( item.title )[ 0 ]
				).toBeInTheDocument();
			}
		} );

		it( 'should render actions dropdown if actions are supported and passed in for each list item', () => {
			render(
				<DataViewWrapper
					view={ {
						type: 'list',
					} }
					actions={ actions }
				/>
			);
			expect(
				screen.getAllByRole( 'button', { name: 'Actions' } ).length
			).toEqual( 3 );
		} );
	} );
} );
