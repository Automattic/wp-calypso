/**
 * @jest-environment jsdom
 */
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRoot } from 'react-dom/client';
import { recordPageView } from 'calypso/lib/analytics/page-view';
import { recordUnifiedAdminPageView } from 'calypso/lib/analytics/record-admin-page-view';
import type { ReactNode } from 'react';

jest.mock( 'react-dom/client', () => {
	const actual = jest.requireActual< typeof import( 'react-dom/client' ) >( 'react-dom/client' );
	return { ...actual, createRoot: jest.fn( actual.createRoot ) };
} );
jest.mock( 'calypso/lib/user/shared-utils', () => ( {
	initializeCurrentUser: async () => ( { ID: 123 } ),
} ) );
jest.mock( 'calypso/state/query-client', () => {
	const { QueryClient } =
		jest.requireActual< typeof import( '@tanstack/react-query' ) >( '@tanstack/react-query' );
	return { createQueryClient: async () => ( { queryClient: new QueryClient() } ) };
} );
jest.mock( 'calypso/lib/analytics/page-view' );
jest.mock( 'calypso/lib/analytics/record-admin-page-view' );
jest.mock( '@automattic/data-stores', () => {
	const actual =
		jest.requireActual< typeof import( '@automattic/data-stores' ) >( '@automattic/data-stores' );
	return {
		...actual,
		SubscriptionManager: {
			...actual.SubscriptionManager,
			useSubscriptionsCountQuery: () => ( { data: { blogs: 2, pending: 1 } } ),
			useSiteSubscriptionDetailsQuery: () => ( { isLoading: false } ),
			useSiteSubscriptionsQuery: () => ( { data: { subscriptions: [], totalCount: 0 } } ),
			useUserSettingsQuery: () => ( { isLoading: false } ),
		},
	};
} );

let app: ReactNode;
const recordView = jest.mocked( recordUnifiedAdminPageView );

function renderSubscriptions( initialPath: string, ...history: string[] ) {
	window.history.replaceState( null, '', initialPath );
	history.forEach( ( path ) => window.history.pushState( null, '', path ) );
	return render( app );
}

const pageViewCalls = ( paths: string[], route?: string ) =>
	paths.map( ( path ) => [
		{ source: 'calypso', app: 'subscriptions', path, route: route ?? path },
	] );

async function goBack() {
	await act(
		() =>
			new Promise< void >( ( resolve ) => {
				window.addEventListener( 'popstate', () => resolve(), { once: true } );
				window.history.back();
			} )
	);
}

describe( 'Subscriptions unified page views', () => {
	beforeAll( async () => {
		const rendered = new Promise< ReactNode >( ( resolve ) => {
			jest.mocked( createRoot ).mockReturnValueOnce( {
				render: resolve,
				unmount: jest.fn(),
			} );
		} );
		await import( '../index' );
		app = await rendered;
	} );

	beforeEach( () => {
		jest.clearAllMocks();
		recordView.mockReset();
	} );

	afterEach( () => window.history.replaceState( null, '', '/' ) );

	it.each( [
		[ '/subscriptions', '/subscriptions/sites' ],
		[ '/subscriptions/', '/subscriptions/sites' ],
		[ '/subscriptions/sites/de?sort=name', '/subscriptions/sites/de' ],
	] )( 'records the committed view of %s', ( url, path ) => {
		recordView.mockImplementation( () => {
			expect( screen.getByText( 'You are not subscribed to any sites.' ) ).toBeVisible();
		} );
		renderSubscriptions( url );
		expect( recordView.mock.calls ).toEqual( pageViewCalls( [ path ], '/subscriptions/sites' ) );
	} );

	it( 'counts tab changes and return visits', async () => {
		const user = userEvent.setup();
		renderSubscriptions( '/subscriptions/sites' );
		const page = within( screen.getByRole( 'main' ) );
		const tabs = within( page.getByRole( 'menu' ) );

		await user.click( tabs.getByRole( 'menuitem', { name: 'Sites 2' } ) );
		await user.click( tabs.getByRole( 'menuitem', { name: 'Settings' } ) );
		await user.click( tabs.getByRole( 'menuitem', { name: 'Sites 2' } ) );
		expect( recordView.mock.calls ).toEqual(
			pageViewCalls( [ '/subscriptions/sites', '/subscriptions/settings', '/subscriptions/sites' ] )
		);
	} );

	it.each( [ '?sort=name', '#details' ] )( 'does not count changes to %s', async ( suffix ) => {
		renderSubscriptions( '/subscriptions/sites', `/subscriptions/sites${ suffix }` );
		await goBack();
		expect( recordView.mock.calls ).toEqual( pageViewCalls( [ '/subscriptions/sites' ] ) );
	} );

	it( 'counts site changes while preserving legacy tracking', async () => {
		renderSubscriptions(
			'/subscriptions/site/123',
			'/subscriptions/site/456?source=email#details'
		);
		await goBack();

		expect( recordView.mock.calls ).toEqual(
			pageViewCalls(
				[ '/subscriptions/site/456', '/subscriptions/site/123' ],
				'/subscriptions/site/:blogId'
			)
		);
		expect( recordPageView ).toHaveBeenCalledTimes( 1 );
	} );
} );
