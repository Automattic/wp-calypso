/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { useState } from 'react';
import { DataViews } from '../dataviews';
import type { Field, View } from '@wordpress/dataviews';

type NamedItem = { id: string; name: string };

const items: NamedItem[] = [ 'One', 'Two', 'Three', 'Four', 'Five' ].map( ( name, index ) => ( {
	id: String( index + 1 ),
	name,
} ) );

const fields: Field< NamedItem >[] = [ { id: 'name', label: 'Name', enableHiding: false } ];

function List() {
	const [ view, setView ] = useState< View >( {
		type: 'table',
		fields: [ 'name' ],
		page: 1,
		perPage: 2,
		search: '',
	} );
	const { data, paginationInfo } = filterSortAndPaginate( items, view, fields );

	return (
		<DataViews< NamedItem >
			data={ data }
			fields={ fields }
			view={ view }
			onChangeView={ setView }
			paginationInfo={ paginationInfo }
			defaultLayouts={ { table: {} } }
			getItemId={ ( item ) => item.id }
		/>
	);
}

describe( '<DataViews>', () => {
	test( 'shows the next page when the user moves to it', async () => {
		const user = userEvent.setup();
		render( <List /> );

		expect( screen.getByRole( 'cell', { name: 'One' } ) ).toBeVisible();

		await user.click( screen.getByRole( 'button', { name: 'Next page' } ) );

		expect( await screen.findByRole( 'cell', { name: 'Three' } ) ).toBeVisible();
		expect( screen.queryByRole( 'cell', { name: 'One' } ) ).not.toBeInTheDocument();
	} );
} );
