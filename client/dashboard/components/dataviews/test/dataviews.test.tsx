/**
 * @jest-environment jsdom
 */
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../test-utils';
import { DataViews } from '../dataviews';
import type { Field, SupportedLayouts, View } from '@wordpress/dataviews';

type Item = { id: string; name: string };

const fields: Field< Item >[] = [
	{ id: 'name', label: 'Name', getValue: ( { item } ) => item.name, enableGlobalSearch: true },
];

const renderDataViews = ( view: View, defaultLayouts: SupportedLayouts = { table: {} } ) =>
	render(
		<DataViews< Item >
			data={ [ { id: '1', name: 'First item' } ] }
			fields={ fields }
			view={ view }
			onChangeView={ jest.fn() }
			paginationInfo={ { totalItems: 1, totalPages: 1 } }
			defaultLayouts={ defaultLayouts }
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

	test( 'records the fallback once, even when the screen updates', async () => {
		const { recordTracksEvent } = renderDataViews( {
			type: 'grid',
			titleField: 'name',
			fields: [],
		} );
		const user = userEvent.setup();

		await user.type( await screen.findByRole( 'searchbox' ), 'First' );

		expect( recordTracksEvent ).toHaveBeenCalledTimes( 1 );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_dashboard_dataviews_saved_layout_fallback',
			{ saved_layout: 'grid', fallback_layout: 'table' }
		);
	} );

	test( 'records nothing when the saved layout is available', async () => {
		const { recordTracksEvent } = renderDataViews( {
			type: 'table',
			titleField: 'name',
			fields: [],
		} );

		await screen.findByRole( 'table' );
		expect( recordTracksEvent ).not.toHaveBeenCalled();
	} );

	test( 'records when no layout can show the view', async () => {
		const { recordTracksEvent } = renderDataViews(
			{ type: 'grid', titleField: 'name', fields: [] },
			{ pickerTable: {} }
		);

		await waitFor( () =>
			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_dashboard_dataviews_no_available_layout',
				{ saved_layout: 'grid' }
			)
		);
		expect( screen.queryByRole( 'table' ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'searchbox' ) ).not.toBeInTheDocument();
	} );
} );
