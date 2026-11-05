/**
 * @jest-environment jsdom
 */
import { screen, within } from '@testing-library/react';
import { render } from '../../../test-utils';
import { DataViews } from '../dataviews';
import type { Field, View } from '@wordpress/dataviews';

type Item = { id: string; name: string };

const fields: Field< Item >[] = [
	{ id: 'name', label: 'Name', getValue: ( { item } ) => item.name, enableGlobalSearch: true },
];

const renderDataViews = ( view: View, onChangeView = jest.fn() ) =>
	render(
		<DataViews< Item >
			data={ [ { id: '1', name: 'First item' } ] }
			fields={ fields }
			view={ view }
			onChangeView={ onChangeView }
			paginationInfo={ { totalItems: 1, totalPages: 1 } }
			defaultLayouts={ { table: {} } }
			getItemId={ ( item ) => item.id }
			onReset={ jest.fn() }
		/>
	);

describe( '<DataViews>', () => {
	test( 'keeps a saved view on screen when its layout is not available', async () => {
		renderDataViews( {
			type: 'grid',
			titleField: 'name',
			fields: [],
			layout: { previewSize: 290 },
		} );

		expect( within( await screen.findByRole( 'table' ) ).getByText( 'First item' ) ).toBeVisible();
		expect( screen.getByRole( 'searchbox' ) ).toBeVisible();
	} );
} );
