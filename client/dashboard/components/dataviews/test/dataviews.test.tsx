/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
	createMemoryHistory,
	createRootRoute,
	createRoute,
	createRouter,
	RouterProvider,
} from '@tanstack/react-router';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import nock from 'nock';
import { Suspense } from 'react';
import { usePersistentView } from '../../../app/hooks/use-persistent-view';
import { DataViews } from '../dataviews';
import type { Field, View } from '@wordpress/dataviews';

type NamedItem = { id: string; name: string };

const items: NamedItem[] = [ 'One', 'Two', 'Three', 'Four', 'Five' ].map( ( name, index ) => ( {
	id: String( index + 1 ),
	name,
} ) );

const fields: Field< NamedItem >[] = [ { id: 'name', label: 'Name', enableHiding: false } ];

const defaultView: View = { type: 'table', fields: [ 'name' ], perPage: 2, search: '' };

function renderDataViews( {
	page,
	totalPages,
	isLoading = false,
	onPageCorrection = jest.fn(),
}: {
	page: number;
	totalPages: number;
	isLoading?: boolean;
	onPageCorrection?: ( page: number ) => void;
} ) {
	const onChangeView = jest.fn();

	render(
		<DataViews< NamedItem >
			data={ [] }
			fields={ fields }
			view={ { ...defaultView, page } }
			isLoading={ isLoading }
			onChangeView={ onChangeView }
			onPageCorrection={ onPageCorrection }
			paginationInfo={ { totalItems: totalPages * 2, totalPages } }
			defaultLayouts={ { table: {} } }
			getItemId={ ( item ) => item.id }
		/>
	);

	return { onChangeView, onPageCorrection };
}

describe( '<DataViews>', () => {
	beforeAll( () => {
		// The wrapper scrolls to the top on a page change, which jsdom does not implement.
		window.scrollTo = jest.fn();
		Element.prototype.scrollTo = jest.fn();
	} );

	describe( 'onPageCorrection', () => {
		test( 'is called with the last page when the page is past it, in place of onChangeView', () => {
			const { onChangeView, onPageCorrection } = renderDataViews( { page: 99, totalPages: 3 } );

			expect( onPageCorrection ).toHaveBeenCalledTimes( 1 );
			expect( onPageCorrection ).toHaveBeenCalledWith( 3 );
			expect( onChangeView ).not.toHaveBeenCalled();
		} );

		test( 'is called with the first page when the list has no pages', () => {
			const { onPageCorrection } = renderDataViews( { page: 2, totalPages: 0 } );

			expect( onPageCorrection ).toHaveBeenCalledWith( 1 );
		} );

		test( 'is not called while the list is loading', () => {
			const { onPageCorrection } = renderDataViews( {
				page: 99,
				totalPages: 3,
				isLoading: true,
			} );

			expect( onPageCorrection ).not.toHaveBeenCalled();
		} );

		test( 'is not called for a page the list has', () => {
			const { onPageCorrection } = renderDataViews( { page: 3, totalPages: 3 } );

			expect( onPageCorrection ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'with usePersistentView', () => {
		function renderList( initialEntries: string[] ) {
			nock( 'https://public-api.wordpress.com' )
				.get( '/rest/v1.1/me/preferences' )
				.reply( 200, { calypso_preferences: {} } );

			const rootRoute = createRootRoute();
			const homeRoute = createRoute( {
				getParentRoute: () => rootRoute,
				path: '/',
				component: () => <p>Home</p>,
			} );
			const listRoute = createRoute( {
				getParentRoute: () => rootRoute,
				path: '/list',
				validateSearch: ( search: Record< string, unknown > ) => ( {
					page: Number( search.page ) || undefined,
				} ),
				component: function List() {
					const { view, updateView, correctPage } = usePersistentView( {
						slug: 'test-list',
						defaultView,
						queryParams: listRoute.useSearch(),
					} );
					const { data, paginationInfo } = filterSortAndPaginate( items, view, fields );

					return (
						<DataViews< NamedItem >
							data={ data }
							fields={ fields }
							view={ view }
							onChangeView={ updateView }
							onPageCorrection={ correctPage }
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

			render(
				<QueryClientProvider
					client={ new QueryClient( { defaultOptions: { queries: { retry: false } } } ) }
				>
					<Suspense fallback={ null }>
						<RouterProvider router={ router } />
					</Suspense>
				</QueryClientProvider>
			);

			return router;
		}

		test( 'corrects a page past the last one in place, so that Back leaves the list', async () => {
			const router = renderList( [ '/', '/list?page=99' ] );

			expect( await screen.findByText( 'Five' ) ).toBeVisible();
			expect( router.state.location.search ).toEqual( { page: 3 } );

			act( () => router.history.back() );

			expect( await screen.findByText( 'Home' ) ).toBeVisible();
		} );

		test( 'keeps a history entry for each page the user moves to', async () => {
			const user = userEvent.setup();
			const router = renderList( [ '/', '/list' ] );

			expect( await screen.findByText( 'One' ) ).toBeVisible();

			await user.click( screen.getByRole( 'button', { name: 'Next page' } ) );

			expect( await screen.findByText( 'Three' ) ).toBeVisible();

			act( () => router.history.back() );

			expect( await screen.findByText( 'One' ) ).toBeVisible();
			await waitFor( () => expect( router.state.location.pathname ).toBe( '/list' ) );
		} );
	} );
} );
