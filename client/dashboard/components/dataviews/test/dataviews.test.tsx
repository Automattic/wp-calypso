/**
 * @jest-environment jsdom
 */
import {
	createMemoryHistory,
	createRootRoute,
	createRoute,
	createRouter,
	RouterProvider,
} from '@tanstack/react-router';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { DataViews } from '../dataviews';
import type { Field, View } from '@wordpress/dataviews';

type NamedItem = { id: string; name: string };

const items: NamedItem[] = [ 'One', 'Two', 'Three', 'Four', 'Five' ].map( ( name, index ) => ( {
	id: String( index + 1 ),
	name,
} ) );

const fields: Field< NamedItem >[] = [ { id: 'name', label: 'Name', enableHiding: false } ];

// `search` is set so that the search control has nothing to add on mount.
const defaultView: View = { type: 'table', fields: [ 'name' ], perPage: 2, search: '' };

function renderList( initialEntries: string[] ) {
	const rootRoute = createRootRoute();
	const homeRoute = createRoute( {
		getParentRoute: () => rootRoute,
		path: '/',
		component: () => <h1>Home</h1>,
	} );
	const listRoute = createRoute( {
		getParentRoute: () => rootRoute,
		path: '/list',
		validateSearch: ( search: Record< string, unknown > ) => ( {
			page: Number( search.page ) || undefined,
		} ),
		component: function List() {
			const { page = 1 } = listRoute.useSearch();
			const navigate = listRoute.useNavigate();
			const view = { ...defaultView, page };
			const { data, paginationInfo } = filterSortAndPaginate( items, view, fields );

			return (
				<DataViews< NamedItem >
					data={ data }
					fields={ fields }
					view={ view }
					onChangeView={ ( nextView ) => navigate( { search: { page: nextView.page } } ) }
					paginationInfo={ paginationInfo }
					defaultLayouts={ { table: {} } }
					getItemId={ ( item ) => item.id }
				/>
			);
		},
	} );

	const router = createRouter( {
		routeTree: rootRoute.addChildren( [ homeRoute, listRoute ] ),
		history: createMemoryHistory( { initialEntries } ),
	} );

	render( <RouterProvider router={ router } /> );

	return router;
}

describe( '<DataViews>', () => {
	test( 'shows the page in the URL, and Back leaves the list', async () => {
		const router = renderList( [ '/', '/list?page=2' ] );

		expect( await screen.findByRole( 'cell', { name: 'Three' } ) ).toBeVisible();

		act( () => router.history.back() );

		expect( await screen.findByRole( 'heading', { name: 'Home' } ) ).toBeVisible();
	} );

	test( 'keeps a history entry for each page the user moves to', async () => {
		const user = userEvent.setup();
		const router = renderList( [ '/', '/list' ] );

		expect( await screen.findByRole( 'cell', { name: 'One' } ) ).toBeVisible();

		await user.click( screen.getByRole( 'button', { name: 'Next page' } ) );

		expect( await screen.findByRole( 'cell', { name: 'Three' } ) ).toBeVisible();
		expect( router.state.location.search ).toEqual( { page: 2 } );

		act( () => router.history.back() );

		expect( await screen.findByRole( 'cell', { name: 'One' } ) ).toBeVisible();
		expect( router.state.location.pathname ).toBe( '/list' );
	} );
} );
