/**
 * @jest-environment jsdom
 */
import {
	recordTracksEvent, // eslint-disable-line no-restricted-imports
	recordTracksPageViewWithPageParams, // eslint-disable-line no-restricted-imports
} from '@automattic/calypso-analytics';
import {
	createControlledPromise,
	createMemoryHistory,
	createRootRoute,
	createRoute,
	createRouter,
	Outlet,
} from '@tanstack/react-router';
import { act, waitFor } from '@testing-library/react';
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

async function renderTracker(
	app: AppConfig[ 'unifiedAdminPageViewApp' ] | null = 'msd',
	initialPath = '/sites/first.example',
	basePath = ''
) {
	const pendingLoad = createControlledPromise< void >();
	const appConfig = {
		...APP_CONTEXT_DEFAULT_CONFIG,
		basePath: basePath || '/',
		unifiedAdminPageViewApp: app ?? undefined,
	};
	const rootRoute = createRootRoute( {
		component: () => (
			<>
				<Outlet />
				<PageViewTracker />
			</>
		),
	} );
	const redirectToSite = () => {
		throw dashboardRedirect( { to: '/sites/$siteSlug', params: { siteSlug: 'first.example' } } );
	};
	const router = createRouter( {
		routeTree: rootRoute.addChildren( [
			createRoute( {
				getParentRoute: () => rootRoute,
				path: '/sites',
			} ),
			createRoute( {
				getParentRoute: () => rootRoute,
				path: '/sites/$siteSlug',
				loader: ( { params } ) =>
					params.siteSlug === 'pending.example' ? pendingLoad : undefined,
			} ),
			...( [ 'beforeLoad', 'loader' ] as const ).map( ( hook ) =>
				createRoute( {
					getParentRoute: () => rootRoute,
					path: `/${ hook }-redirect`,
					[ hook ]: redirectToSite,
				} )
			),
		] ),
		history: createMemoryHistory( { initialEntries: [ `${ basePath }${ initialPath }` ] } ),
		basepath: basePath || '/',
		defaultPendingMs: 0,
		defaultPendingMinMs: 0,
	} );

	jest.mocked< ( config: AppConfig ) => AnyRouter >( getRouter ).mockReturnValue( router );
	render( <Layout config={ appConfig } /> );
	await waitFor( () => {
		expect( router.state.status ).toBe( 'idle' );
		expect( router.state.matches.at( -1 )?.status ).toBe( 'success' );
	} );
	const tracksEvent = jest.mocked( recordTracksEvent );
	return {
		router,
		pendingLoad,
		recordTracksEvent: tracksEvent,
		recordedPaths: () => tracksEvent.mock.calls.map( ( [ , properties ] ) => properties?.path ),
		navigate: ( href: string ) => act( () => router.navigate( { href } ) ),
	};
}

describe( 'Unified admin page views', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it.each( [
		{ app: 'msd', basePath: '/dashboard' },
		{ app: 'a4a', basePath: '' },
	] as const )( 'records an initial view for $app', async ( { app, basePath } ) => {
		const { recordTracksEvent } = await renderTracker(
			app,
			'/sites/first.example?tab=general#details',
			basePath
		);

		expect( recordTracksEvent ).toHaveBeenCalledTimes( 1 );
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'wpcom_unified_admin_page_view', {
			source: 'msd',
			app,
			path: `${ basePath }/sites/first.example`,
			route: `${ basePath }/sites/$siteSlug`,
		} );
	} );

	it( 'counts pathname changes', async () => {
		const { router, navigate, recordedPaths } = await renderTracker();
		const paths = [
			'/sites/first.example',
			'/sites/second.example',
			'/sites/first.example',
			'/sites',
			'/sites/first.example',
		];
		for ( const path of paths ) {
			await navigate( path );
		}
		await navigate( '/sites/first.example?tab=general#details' );
		await act( () => router.invalidate() );

		expect( recordedPaths() ).toEqual( paths );
		expect( recordTracksPageViewWithPageParams ).toHaveBeenCalledTimes( 3 );
	} );

	it.each( [ '/sites/pending.example', '/sites' ] )(
		'records only the completed destination %s',
		async ( destination ) => {
			const { router, navigate, pendingLoad, recordedPaths } = await renderTracker();
			let navigation!: ReturnType< typeof router.navigate >;
			act( () => {
				navigation = router.navigate( { href: '/sites/pending.example' } );
			} );
			await waitFor( () => expect( router.state.status ).toBe( 'pending' ) );
			expect( recordedPaths() ).toEqual( [ '/sites/first.example' ] );
			if ( destination === '/sites' ) {
				await navigate( destination );
			}
			await act( async () => {
				pendingLoad.resolve();
				await navigation;
			} );
			expect( recordedPaths() ).toEqual( [ '/sites/first.example', destination ] );
		}
	);

	it.each( [ '/beforeLoad-redirect', '/loader-redirect' ] )(
		'counts only the destination of %s',
		async ( initialPath ) => {
			const { navigate, recordedPaths } = await renderTracker( 'msd', initialPath );

			await navigate( '/sites' );
			await navigate( initialPath );
			await navigate( initialPath );
			expect( recordedPaths() ).toEqual( [
				'/sites/first.example',
				'/sites',
				'/sites/first.example',
			] );
		}
	);

	it( 'does not track apps without unified tracking enabled', async () => {
		const { recordTracksEvent } = await renderTracker( null );

		expect( recordTracksEvent ).not.toHaveBeenCalled();
		expect( recordTracksPageViewWithPageParams ).toHaveBeenCalledTimes( 1 );
	} );
} );
