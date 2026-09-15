/**
 * @jest-environment jsdom
 */
import {
	createMemoryHistory,
	createRootRoute,
	createRoute,
	createRouter,
	Outlet,
	RouterProvider,
} from '@tanstack/react-router';
import { act, screen, waitFor } from '@testing-library/react';
import { PageViewTracker } from '../';
import { APP_CONTEXT_DEFAULT_CONFIG } from '../../../app/context';
import { dashboardRedirect } from '../../../app/router/redirect';
import { render } from '../../../test-utils';
import type { AppConfig } from '../../../app/context';

function renderTracker( {
	config = { unifiedAdminPageViewApp: 'msd' },
	initialPath = '/sites/first.example',
	loader,
}: {
	config?: Partial< AppConfig >;
	initialPath?: string;
	loader?: ( siteSlug: string ) => Promise< void >;
} = {} ) {
	const appConfig = { ...APP_CONTEXT_DEFAULT_CONFIG, basePath: '/', ...config };
	const rootRoute = createRootRoute( {
		component: () => (
			<div data-testid="route-layout">
				<Outlet />
				<PageViewTracker />
			</div>
		),
	} );
	const siteRoute = createRoute( {
		getParentRoute: () => rootRoute,
		path: '/sites/$siteSlug',
		loader: ( { params } ) => loader?.( params.siteSlug ),
		component: () => <div>Site view</div>,
	} );
	const redirectToSite = () => {
		throw dashboardRedirect( { to: '/sites/$siteSlug', params: { siteSlug: 'first.example' } } );
	};
	const guardRedirectRoute = createRoute( {
		getParentRoute: () => rootRoute,
		path: '/guard-redirect',
		beforeLoad: redirectToSite,
	} );
	const loaderRedirectRoute = createRoute( {
		getParentRoute: () => rootRoute,
		path: '/loader-redirect',
		loader: redirectToSite,
	} );
	const router = createRouter( {
		routeTree: rootRoute.addChildren( [ siteRoute, guardRedirectRoute, loaderRedirectRoute ] ),
		history: createMemoryHistory( { initialEntries: [ initialPath ] } ),
		basepath: appConfig.basePath,
		defaultPendingMs: 0,
		defaultPendingMinMs: 0,
	} );
	const result = render( <RouterProvider router={ router } />, { config: appConfig } );

	return { ...result, router };
}

describe( 'PageViewTracker unified admin page views', () => {
	it.each( [
		{ app: 'msd', basePath: '/dashboard' },
		{ app: 'a4a', basePath: '' },
	] as const )( 'records after the route layout commits for $app', async ( { app, basePath } ) => {
		const { recordTracksEvent } = renderTracker( {
			config: { unifiedAdminPageViewApp: app, basePath: basePath || '/' },
			initialPath: `${ basePath }/sites/first.example?tab=general#details`,
		} );
		const committedContent = jest.fn();
		jest.mocked( recordTracksEvent ).mockImplementation( () => {
			committedContent( screen.queryByTestId( 'route-layout' ) );
		} );

		await waitFor( () => expect( recordTracksEvent ).toHaveBeenCalledTimes( 1 ) );
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'wpcom_unified_admin_page_view', {
			source: 'msd',
			app,
			path: `${ basePath }/sites/first.example`,
			route: `${ basePath }/sites/$siteSlug`,
		} );
		expect( committedContent ).toHaveBeenCalledWith( screen.getByTestId( 'route-layout' ) );
		expect( await screen.findByText( 'Site view' ) ).toBeVisible();
	} );

	it( 'counts site switches and return visits without changing legacy page views', async () => {
		const { router, recordTracksEvent, recordPageView } = renderTracker();
		await waitFor( () => expect( recordTracksEvent ).toHaveBeenCalledTimes( 1 ) );

		for ( const siteSlug of [ 'first.example', 'second.example', 'first.example' ] ) {
			await act( () => router.navigate( { to: '/sites/$siteSlug', params: { siteSlug } } ) );
		}
		await act( () =>
			router.navigate( {
				to: '/sites/$siteSlug',
				params: { siteSlug: 'first.example' },
				search: ( previous: Record< string, unknown > ) => ( { ...previous, tab: 'general' } ),
				hash: 'details',
			} )
		);
		await act( () => router.invalidate() );

		expect(
			jest.mocked( recordTracksEvent ).mock.calls.map( ( [ , properties ] ) => properties?.path )
		).toEqual( [ '/sites/first.example', '/sites/second.example', '/sites/first.example' ] );
		expect( recordPageView ).toHaveBeenCalledTimes( 1 );
		expect( recordPageView ).toHaveBeenCalledWith( '/sites/$siteSlug', document.title );
	} );

	it( 'waits for a pending navigation before recording the destination', async () => {
		let finishLoading!: () => void;
		const pendingLoad = new Promise< void >( ( resolve ) => {
			finishLoading = resolve;
		} );
		const { router, recordTracksEvent } = renderTracker( {
			loader: async ( siteSlug ) => {
				if ( siteSlug === 'second.example' ) {
					await pendingLoad;
				}
			},
		} );
		await waitFor( () => expect( recordTracksEvent ).toHaveBeenCalledTimes( 1 ) );

		let navigation: ReturnType< typeof router.navigate >;
		act( () => {
			navigation = router.navigate( {
				to: '/sites/$siteSlug',
				params: { siteSlug: 'second.example' },
			} );
		} );
		await waitFor( () => expect( router.state.status ).toBe( 'pending' ) );
		expect( recordTracksEvent ).toHaveBeenCalledTimes( 1 );

		await act( async () => {
			finishLoading();
			await navigation;
		} );
		await waitFor( () => expect( recordTracksEvent ).toHaveBeenCalledTimes( 2 ) );
		expect( recordTracksEvent ).toHaveBeenLastCalledWith(
			'wpcom_unified_admin_page_view',
			expect.objectContaining( { path: '/sites/second.example' } )
		);
	} );

	it( 'does not count a navigation superseded while its loader is pending', async () => {
		let finishLoading!: () => void;
		const pendingLoad = new Promise< void >( ( resolve ) => {
			finishLoading = resolve;
		} );
		const { router, recordTracksEvent } = renderTracker( {
			loader: async ( siteSlug ) => {
				if ( siteSlug === 'second.example' ) {
					await pendingLoad;
				}
			},
		} );
		await waitFor( () => expect( recordTracksEvent ).toHaveBeenCalledTimes( 1 ) );

		let navigation: ReturnType< typeof router.navigate >;
		act( () => {
			navigation = router.navigate( {
				to: '/sites/$siteSlug',
				params: { siteSlug: 'second.example' },
			} );
		} );
		await waitFor( () => expect( router.state.status ).toBe( 'pending' ) );
		await act( () =>
			router.navigate( { to: '/sites/$siteSlug', params: { siteSlug: 'third.example' } } )
		);
		await waitFor( () => expect( recordTracksEvent ).toHaveBeenCalledTimes( 2 ) );

		await act( async () => {
			finishLoading();
			await navigation;
		} );
		expect(
			jest.mocked( recordTracksEvent ).mock.calls.map( ( [ , properties ] ) => properties?.path )
		).toEqual( [ '/sites/first.example', '/sites/third.example' ] );
	} );

	it.each( [ '/guard-redirect', '/loader-redirect' ] )(
		'counts only the destination of %s',
		async ( initialPath ) => {
			const { recordTracksEvent } = renderTracker( { initialPath } );

			await waitFor( () => expect( recordTracksEvent ).toHaveBeenCalledTimes( 1 ) );
			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'wpcom_unified_admin_page_view',
				expect.objectContaining( { path: '/sites/first.example', route: '/sites/$siteSlug' } )
			);
		}
	);

	it( 'keeps legacy tracking for apps without unified tracking enabled, including CIAB', async () => {
		const { recordTracksEvent, recordPageView } = renderTracker( { config: { name: 'CIAB' } } );

		await waitFor( () => expect( recordPageView ).toHaveBeenCalledTimes( 1 ) );
		expect( recordTracksEvent ).not.toHaveBeenCalled();
	} );
} );
