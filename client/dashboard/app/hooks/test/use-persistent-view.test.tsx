/**
 * @jest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRouter, RouterProvider, createRootRoute, createRoute } from '@tanstack/react-router';
import { act, renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import { Suspense } from 'react';
import { usePersistentView } from '../use-persistent-view';
import type { View } from '@wordpress/dataviews';

const defaultView: View = {
	type: 'table',
	layout: { density: 'compact' },
	sort: { field: 'name', direction: 'asc' },
};
const slug = 'sites';

function createTestWrapper() {
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

describe( 'usePersistentView', () => {
	describe( 'view', () => {
		it( 'should return the default view if there is no persisted view yet', async () => {
			mockGetCalypsoPreferences( {} );

			const { Wrapper } = createTestWrapper();
			const { result } = renderHook( () => usePersistentView( { slug, defaultView } ), {
				wrapper: Wrapper,
			} );

			await waitFor( () => {
				expect( result.current.view ).toEqual( {
					...defaultView,
					page: 1,
					search: '',
				} );
			} );
		} );

		it( 'should return the persisted view if exists', async () => {
			const persistedView = {
				type: 'grid',
				layout: { previewSize: 120 },
				sort: { field: 'name', direction: 'asc' },
			};
			mockGetCalypsoPreferences( {
				'hosting-dashboard-dataviews-view-sites': persistedView,
			} );

			const { Wrapper } = createTestWrapper();
			const { result } = renderHook( () => usePersistentView( { slug, defaultView } ), {
				wrapper: Wrapper,
			} );

			await waitFor( () => {
				expect( result.current.view ).toEqual( {
					...persistedView,
					page: 1,
					search: '',
				} );
			} );
		} );

		it( 'should return the persisted view with synced transient properties from the current URL query params', async () => {
			const persistedView = {
				type: 'grid',
				layout: { previewSize: 120 },
				sort: { field: 'name', direction: 'asc' },
			};
			mockGetCalypsoPreferences( {
				'hosting-dashboard-dataviews-view-sites': persistedView,
			} );

			const { Wrapper } = createTestWrapper();

			const queryParams = { 'current-param': 'current-value', page: 2, search: 'test' };
			const { result } = renderHook(
				() => usePersistentView( { slug, defaultView, queryParams } ),
				{
					wrapper: Wrapper,
				}
			);

			await waitFor( () => {
				expect( result.current.view ).toEqual( {
					...persistedView,
					page: 2,
					search: 'test',
				} );
			} );
		} );

		it( 'should return the persisted view merged with transient filters from the current URL query params', async () => {
			const persistedView = {
				type: 'grid',
				layout: { previewSize: 120 },
				sort: { field: 'status', direction: 'asc' },
				filters: [ { field: 'status', operator: 'isAny', value: [ 'active' ] } ],
			};
			mockGetCalypsoPreferences( {
				'hosting-dashboard-dataviews-view-sites': persistedView,
			} );

			const { Wrapper } = createTestWrapper();

			const queryParams = {
				'current-param': 'current-value',
				page: 2,
				search: 'test',
				domainName: 'example.com',
			};
			const queryParamFilterFields = [ 'domainName' ];
			const { result } = renderHook(
				() =>
					usePersistentView( {
						slug,
						defaultView,
						queryParams,
						queryParamFilterFields,
					} ),
				{
					wrapper: Wrapper,
				}
			);

			await waitFor( () => {
				expect( result.current.view ).toEqual( {
					...persistedView,
					filters: [
						{ field: 'status', operator: 'isAny', value: [ 'active' ] },
						{ field: 'domainName', operator: 'isAny', value: [ 'example.com' ] },
					],
					page: 2,
					search: 'test',
				} );
			} );
		} );
	} );

	describe( 'updateView', () => {
		it( 'should persist the new view', async () => {
			mockGetCalypsoPreferences( {} );

			const viewToPersist: View = {
				type: 'grid',
				layout: { previewSize: 120 },
				sort: { field: 'name', direction: 'asc' },
			};
			const expectedUpdatePreferences = mockUpdateCalypsoPreferences( {
				'hosting-dashboard-dataviews-view-sites': viewToPersist,
			} );

			const { Wrapper } = createTestWrapper();
			const { result } = renderHook( () => usePersistentView( { slug, defaultView } ), {
				wrapper: Wrapper,
			} );

			await waitFor( () => {
				expect( result.current.updateView ).toBeTruthy();
			} );

			act( () => {
				result.current.updateView( {
					...viewToPersist,
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

			const { Wrapper, getRouter } = createTestWrapper();

			const queryParams = { 'current-param': 'current-value' };
			const { result } = renderHook(
				() => usePersistentView( { slug, defaultView, queryParams } ),
				{
					wrapper: Wrapper,
				}
			);

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

		it( 'should remove transient filters from the current URL query params if no longer in the view', async () => {
			mockGetCalypsoPreferences( {} );
			mockUpdateCalypsoPreferences();

			const { Wrapper, getRouter } = createTestWrapper();

			const queryParams = { 'current-param': 'current-value', domainName: 'active' };
			const queryParamFilterFields = [ 'domainName' ];
			const { result } = renderHook(
				() => usePersistentView( { slug, defaultView, queryParams, queryParamFilterFields } ),
				{
					wrapper: Wrapper,
				}
			);

			await waitFor( () => {
				expect( result.current.updateView ).toBeTruthy();
			} );

			act( () => {
				result.current.updateView( {
					...defaultView,
					filters: [ { field: 'status', operator: 'isAny', value: [ 'active' ] } ],
				} );
			} );

			await waitFor( () => {
				const router = getRouter();
				expect( router?.state.location.search ).toEqual( {
					'current-param': 'current-value',
				} );
			} );
		} );
	} );
} );
