/**
 * @jest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
	createRouter,
	createMemoryHistory,
	RouterProvider,
	createRootRoute,
	createRoute,
} from '@tanstack/react-router';
import { act, renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import { Suspense } from 'react';
import { useView } from '../use-view';
import type { Field, View } from '@wordpress/dataviews';

const defaultFields: Field< any >[] = [
	{ id: 'name', enableSorting: true },
	{ id: 'date', enableSorting: false },
];
const defaultView: View = {
	type: 'table',
	layout: { density: 'compact' },
	sort: { field: 'name', direction: 'asc' },
};
const slug = 'sites';

function createTestWrapper( path = '/' ) {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	let router: ReturnType< typeof createRouter > | undefined;

	const Wrapper = ( { children }: { children: React.ReactNode } ) => {
		const rootRoute = createRootRoute();
		const indexRoute = createRoute( {
			getParentRoute: () => rootRoute,
			path: '/',
			component: () => <Suspense fallback={ null }>{ children }</Suspense>,
		} );

		router = createRouter( {
			routeTree: rootRoute.addChildren( [ indexRoute ] ),
			history: createMemoryHistory( { initialEntries: [ path ] } ),
		} );

		return (
			<QueryClientProvider client={ queryClient }>
				<RouterProvider router={ router } />
			</QueryClientProvider>
		);
	};

	return { Wrapper, getRouter: () => router };
}

function mockGetCalypsoPreferences( preferences: any ) {
	return nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/me/preferences' )
		.reply( 200, { calypso_preferences: preferences } );
}

function mockUpdateCalypsoPreferences( preferences?: any ) {
	return nock( 'https://public-api.wordpress.com' )
		.post(
			'/rest/v1.1/me/preferences',
			preferences && {
				calypso_preferences: preferences,
			}
		)
		.reply( 200 );
}

describe( 'useView', () => {
	describe( 'view', () => {
		it( 'should return the default view if there is no persisted view yet', async () => {
			mockGetCalypsoPreferences( {} );

			const { Wrapper } = createTestWrapper();
			const { result } = renderHook( () => useView( { slug, defaultView, defaultFields } ), {
				wrapper: Wrapper,
			} );

			await waitFor( () => {
				expect( result.current.view ).toEqual( {
					type: 'table',
					layout: { density: 'compact' },
					sort: { field: 'name', direction: 'asc' },
					page: 1,
					search: '',
				} );
			} );
		} );

		it( 'should return the persisted view if exists', async () => {
			mockGetCalypsoPreferences( {
				'hosting-dashboard-dataviews-view-sites': {
					type: 'grid',
					layout: { previewSize: 120 },
					sort: { field: 'name', direction: 'asc' },
				},
			} );

			const { Wrapper } = createTestWrapper();
			const { result } = renderHook( () => useView( { slug, defaultView, defaultFields } ), {
				wrapper: Wrapper,
			} );

			await waitFor( () => {
				expect( result.current.view ).toEqual( {
					type: 'grid',
					layout: { previewSize: 120 },
					sort: { field: 'name', direction: 'asc' },
					page: 1,
					search: '',
				} );
			} );
		} );

		it( 'should sanitize the persisted view', async () => {
			mockGetCalypsoPreferences( {
				'hosting-dashboard-dataviews-view-sites': {
					type: 'grid',

					// invalid preview size
					layout: { previewSize: 100 },

					// non-sortable field
					sort: { field: 'date', direction: 'asc' },
				},
			} );

			const { Wrapper } = createTestWrapper();
			const { result } = renderHook( () => useView( { slug, defaultView, defaultFields } ), {
				wrapper: Wrapper,
			} );

			await waitFor( () => {
				expect( result.current.view ).toEqual( {
					type: 'grid',
					layout: {},
					page: 1,
					search: '',
				} );
			} );
		} );

		it( 'should return the persisted view with synced transient properties from the current URL query params', async () => {
			mockGetCalypsoPreferences( {
				'hosting-dashboard-dataviews-view-sites': {
					type: 'grid',
					layout: { previewSize: 120 },
					sort: { field: 'name', direction: 'asc' },
				},
			} );

			const { Wrapper } = createTestWrapper( '/?current-param=current-value&page=2&search=test' );
			const { result } = renderHook( () => useView( { slug, defaultView, defaultFields } ), {
				wrapper: Wrapper,
			} );

			await waitFor( () => {
				expect( result.current.view ).toEqual( {
					type: 'grid',
					layout: { previewSize: 120 },
					sort: { field: 'name', direction: 'asc' },
					page: 2,
					search: 'test',
				} );
			} );
		} );
	} );

	describe( 'updateView', () => {
		it( 'should persist the new view', async () => {
			mockGetCalypsoPreferences( {} );

			const expectedUpdatePreferences = mockUpdateCalypsoPreferences( {
				'hosting-dashboard-dataviews-view-sites': {
					type: 'grid',
					layout: { previewSize: 120 },
					sort: { field: 'name', direction: 'asc' },
				},
			} );

			const { Wrapper } = createTestWrapper();
			const { result } = renderHook( () => useView( { slug, defaultView, defaultFields } ), {
				wrapper: Wrapper,
			} );

			await waitFor( () => {
				expect( result.current.updateView ).toBeTruthy();
			} );

			act( () => {
				result.current.updateView( {
					type: 'grid',
					layout: { previewSize: 120 },
					sort: { field: 'name', direction: 'asc' },
					page: 1,
					search: '',
				} );
			} );

			await waitFor( () => {
				expect( expectedUpdatePreferences.isDone() ).toBe( true );
			} );
		} );

		it( 'should sync transient properties to the current URL query params', async () => {
			mockGetCalypsoPreferences( {} );
			mockUpdateCalypsoPreferences();

			const { Wrapper, getRouter } = createTestWrapper( '/?current-param=current-value' );
			const { result } = renderHook( () => useView( { slug, defaultView, defaultFields } ), {
				wrapper: Wrapper,
			} );

			await waitFor( () => {
				expect( result.current.updateView ).toBeTruthy();
			} );

			act( () => {
				result.current.updateView( {
					type: 'grid',
					layout: { previewSize: 120 },
					sort: { field: 'name', direction: 'asc' },
					page: 2,
					search: 'test',
				} );
			} );

			await waitFor( () => {
				const router = getRouter();
				expect( router?.state.location.search ).toEqual( {
					'current-param': 'current-value',
					page: 2,
					search: 'test',
				} );
			} );
		} );
	} );
} );
