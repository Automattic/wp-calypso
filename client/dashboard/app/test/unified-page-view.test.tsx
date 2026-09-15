/**
 * @jest-environment jsdom
 */
// eslint-disable-next-line no-restricted-imports
import {
	recordTracksEvent,
	recordTracksPageViewWithPageParams,
} from '@automattic/calypso-analytics';
import {
	createMemoryHistory,
	createRootRoute,
	createRoute,
	createRouter,
	Outlet,
} from '@tanstack/react-router';
import { act, screen, waitFor } from '@testing-library/react';
import { PageViewTracker } from '../../components/page-view-tracker';
import { render } from '../../test-utils';
import { APP_CONTEXT_DEFAULT_CONFIG } from '../context';
import Layout from '../layout';
import { getRouter } from '../router';
import { dashboardRedirect } from '../router/redirect';
import type { AppConfig } from '../context';
import type { AnyRouter } from '@tanstack/react-router';
import type { PropsWithChildren, ReactNode } from 'react';

jest.mock( '@automattic/calypso-analytics', () => ( {
	initializeAnalytics: jest.fn(),
	recordTracksEvent: jest.fn(),
	recordTracksPageViewWithPageParams: jest.fn(),
} ) );
jest.mock( '@automattic/charts', () => ( {
	GlobalChartsProvider: ( { children }: PropsWithChildren ) => children,
} ) );
jest.mock( '../router', () => ( { getRouter: jest.fn() } ) );
jest.mock( '../survicate', () => ( {
	useSurvicate: jest.fn(),
	useSurvicateVisitTraits: jest.fn(),
} ) );
jest.mock( '../auth', () => ( {
	...jest.requireActual( '../auth' ),
	AuthProvider: ( { children }: PropsWithChildren ) => children,
} ) );
jest.mock( '../i18n', () => ( {
	I18nProvider: ( { children }: PropsWithChildren ) => children,
} ) );
jest.mock( 'calypso/lib/color-scheme', () => ( {
	withColorScheme: ( element: ReactNode ) => element,
} ) );

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
	const settingsRoute = createRoute( {
		getParentRoute: () => rootRoute,
		path: '/sites/$siteSlug/settings',
		loader: ( { params } ) => loader?.( params.siteSlug ),
		component: () => <div>Site settings</div>,
	} );
	const sitesRoute = createRoute( {
		getParentRoute: () => rootRoute,
		path: '/sites',
		component: () => <div>Sites</div>,
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
		routeTree: rootRoute.addChildren( [
			siteRoute,
			settingsRoute,
			sitesRoute,
			guardRedirectRoute,
			loaderRedirectRoute,
		] ),
		history: createMemoryHistory( { initialEntries: [ initialPath ] } ),
		basepath: appConfig.basePath,
		defaultPendingMs: 0,
		defaultPendingMinMs: 0,
	} );
	jest.mocked< ( config: AppConfig ) => AnyRouter >( getRouter ).mockReturnValue( router );
	const result = render( <Layout config={ appConfig } /> );

	return { ...result, router };
}

describe( 'MSD unified admin page views', () => {
	beforeEach( () => {
		jest.mocked( recordTracksEvent ).mockReset();
	} );

	it.each( [
		{ app: 'msd', basePath: '/dashboard' },
		{ app: 'a4a', basePath: '' },
	] as const )( 'records after the route layout commits for $app', async ( { app, basePath } ) => {
		renderTracker( {
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

	it( 'shares route-pattern deduplication with the existing page-view event', async () => {
		const { router } = renderTracker();
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

		expect( recordTracksEvent ).toHaveBeenCalledTimes( 1 );
		expect( recordTracksPageViewWithPageParams ).toHaveBeenCalledTimes( 1 );
		expect( recordTracksPageViewWithPageParams ).toHaveBeenCalledWith( '/sites/$siteSlug', {
			device_type: expect.any( String ),
		} );

		await act( () => router.navigate( { to: '/sites' } ) );
		await act( () =>
			router.navigate( { to: '/sites/$siteSlug', params: { siteSlug: 'first.example' } } )
		);

		expect(
			jest.mocked( recordTracksEvent ).mock.calls.map( ( [ , properties ] ) => properties?.path )
		).toEqual( [ '/sites/first.example', '/sites', '/sites/first.example' ] );
		expect( recordTracksPageViewWithPageParams ).toHaveBeenCalledTimes( 3 );
	} );

	it( 'waits for a pending navigation before recording the destination', async () => {
		let finishLoading!: () => void;
		const pendingLoad = new Promise< void >( ( resolve ) => {
			finishLoading = resolve;
		} );
		const { router } = renderTracker( {
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
				to: '/sites/$siteSlug/settings',
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
			expect.objectContaining( { path: '/sites/second.example/settings' } )
		);
	} );

	it( 'does not count a navigation superseded while its loader is pending', async () => {
		let finishLoading!: () => void;
		const pendingLoad = new Promise< void >( ( resolve ) => {
			finishLoading = resolve;
		} );
		const { router } = renderTracker( {
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
				to: '/sites/$siteSlug/settings',
				params: { siteSlug: 'second.example' },
			} );
		} );
		await waitFor( () => expect( router.state.status ).toBe( 'pending' ) );
		await act( () => router.navigate( { to: '/sites' } ) );
		await waitFor( () => expect( recordTracksEvent ).toHaveBeenCalledTimes( 2 ) );

		await act( async () => {
			finishLoading();
			await navigation;
		} );
		expect(
			jest.mocked( recordTracksEvent ).mock.calls.map( ( [ , properties ] ) => properties?.path )
		).toEqual( [ '/sites/first.example', '/sites' ] );
	} );

	it.each( [ '/guard-redirect', '/loader-redirect' ] )(
		'counts only the destination of %s',
		async ( initialPath ) => {
			renderTracker( { initialPath } );

			await waitFor( () => expect( recordTracksEvent ).toHaveBeenCalledTimes( 1 ) );
			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'wpcom_unified_admin_page_view',
				expect.objectContaining( { path: '/sites/first.example', route: '/sites/$siteSlug' } )
			);
		}
	);

	it( 'keeps legacy tracking for apps without unified tracking enabled, including CIAB', async () => {
		renderTracker( { config: { name: 'CIAB' } } );

		await waitFor( () => expect( recordTracksPageViewWithPageParams ).toHaveBeenCalledTimes( 1 ) );
		expect( recordTracksEvent ).not.toHaveBeenCalled();
	} );
} );
